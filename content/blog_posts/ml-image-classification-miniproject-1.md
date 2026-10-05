---
title: "ML Image Classification, Miniproject 1"
date: 2025-08-25
slug: ml-image-classification-miniproject-1
---

I followed along with fast.ai's "Is it a bird?" lesson ([my Kaggle notebook](https://www.kaggle.com/code/austnnet/is-it-a-bird-creating-a-model-from-your-own-data/)), then added a random sampler to check the classifier on images it hadn't seen.

Getting started with fastai is incredibly fast. The course and the book teach "backwards": you build something that works first, then dig into how it works when you need to.

Loving it so far!

## The code

Download some bird and forest photos, train a ResNet-18 for a few epochs, then spot-check it:

```python
import random
import time

from ddgs import DDGS
from fastai.vision.all import *
from fastdownload import download_url


def search_images(keywords, max_images=200):
    return L(DDGS().images(keywords, max_results=max_images)).itemgot("image")


# 1. Build a small dataset: one folder per label
path = Path("bird_or_not")
for label in ("forest", "bird"):
    dest = path / label
    dest.mkdir(exist_ok=True, parents=True)
    download_images(dest, urls=search_images(f"{label} photo"))
    time.sleep(5)
    resize_images(dest, max_size=400, dest=dest)

failed = verify_images(get_image_files(path))
failed.map(Path.unlink)

# 2. Train
dls = DataBlock(
    blocks=(ImageBlock, CategoryBlock),
    get_items=get_image_files,
    splitter=RandomSplitter(valid_pct=0.2, seed=42),
    get_y=parent_label,
    item_tfms=[Resize(192, method="squish")],
).dataloaders(path, bs=32)

learn = vision_learner(dls, resnet18, metrics=error_rate)
learn.fine_tune(3)

# 3. Try one new photo
download_url(search_images("bird photos", max_images=1)[0], "bird.jpg", show_progress=False)
label, _, probs = learn.predict(PILImage.create("bird.jpg"))
print(f"This is a: {label}. Probability it's a bird: {probs[0]:.4f}")


# 4. Spot-check random images from each folder
def test_random_images(learn, path, num_samples=5):
    total_correct = 0
    total_tested = 0

    for category in (d for d in path.iterdir() if d.is_dir()):
        image_files = get_image_files(category)
        if not image_files:
            print(f"No images found in {category.name}")
            continue

        sample = random.sample(list(image_files), min(num_samples, len(image_files)))
        print(f"\n--- Testing {len(sample)} random '{category.name}' images ---")

        for img_path in sample:
            predicted, _, probs = learn.predict(PILImage.create(img_path))
            correct = str(predicted) == category.name
            total_correct += correct
            total_tested += 1
            mark = "✓" if correct else "✗"
            print(f"{mark} {img_path.name[:30]:30} | Predicted: {predicted:6} | Bird prob: {probs[0]:.2%}")

    print(f"\nSUMMARY: {total_correct}/{total_tested} correct ({total_correct / total_tested:.1%} accuracy)")


test_random_images(learn, path, num_samples=3)
```

`probs[0]` is the bird probability because fastai sorts the labels alphabetically, and "bird" comes before "forest."
