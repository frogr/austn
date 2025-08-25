from ddgs import DDGS #DuckDuckGo has changed the api so we need to update 
from fastcore.all import *
import time, json
import random

def search_images(keywords, max_images=200): return L(DDGS().images(keywords, max_results=max_images)).itemgot('image')

urls = search_images('bird photos', max_images=1)
print(urls[0])

from fastdownload import download_url
dest = 'bird.jpg'
download_url(urls[0], dest, show_progress=False)

from fastai.vision.all import *
im = Image.open(dest)
im.to_thumb(256,256)

download_url(search_images('forest photos', max_images=1)[0], 'forest.jpg', show_progress=False)
Image.open('forest.jpg').to_thumb(256,256)

searches = 'forest','bird'
path = Path('bird_or_not')

# for o in searches:
#     dest = (path/o)
#     dest.mkdir(exist_ok=True, parents=True)
#     download_images(dest, urls=search_images(f'{o} photo'))
#     time.sleep(5)
#     resize_images(path/o, max_size=400, dest=path/o)

# failed = verify_images(get_image_files(path))
# failed.map(Path.unlink)
# len(failed)

dls = DataBlock(
    blocks=(ImageBlock, CategoryBlock), 
    get_items=get_image_files, 
    splitter=RandomSplitter(valid_pct=0.2, seed=42),
    get_y=parent_label,
    item_tfms=[Resize(192, method='squish')]
).dataloaders(path, bs=32)

dls.show_batch(max_n=6)

learn = vision_learner(dls, resnet18, metrics=error_rate)
learn.fine_tune(3)

is_bird,_,probs = learn.predict(PILImage.create('bird.jpg'))
print(f"This is a: {is_bird}.")
print(f"Probability it's a bird: {probs[0]:.4f}")

# ============= ADD THIS SECTION FOR RANDOM SAMPLING =============

print("\n" + "="*50)
print("STARTING RANDOM IMAGE TESTING")
print("="*50)

def test_random_images(learn, path, num_samples=5):
    """
    Randomly sample images from each category and test predictions
    """
    # Get all category folders
    categories = [d for d in path.iterdir() if d.is_dir()]
    
    total_correct = 0
    total_tested = 0
    
    for category in categories:
        # Get all image files in this category
        image_files = get_image_files(category)
        
        if len(image_files) == 0:
            print(f"No images found in {category.name}")
            continue
            
        # Randomly sample images
        sample_size = min(num_samples, len(image_files))
        sampled_images = random.sample(list(image_files), sample_size)
        
        print(f"\n--- Testing {sample_size} random '{category.name}' images ---")
        
        for img_path in sampled_images:
            # Make prediction
            pred_class, _, probs = learn.predict(PILImage.create(img_path))
            
            # Check if prediction is correct
            actual_class = category.name
            is_correct = str(pred_class) == actual_class
            
            if is_correct:
                total_correct += 1
            total_tested += 1
            
            # Print result with emoji for quick visual feedback
            status = "✓" if is_correct else "✗"
            print(f"{status} {img_path.name[:30]:30} | Predicted: {pred_class:6} | Bird prob: {probs[0]:.2%}")
    
    # Print summary
    print(f"\n{'='*50}")
    print(f"SUMMARY: {total_correct}/{total_tested} correct ({total_correct/total_tested:.1%} accuracy)")
    print(f"{'='*50}\n")

# Test 3 random images from each category
test_random_images(learn, path, num_samples=3)

# Optional: Keep testing more random images
while True:
    response = input("Test more random images? (y/n): ").lower()
    if response == 'y':
        test_random_images(learn, path, num_samples=3)
    else:
        print("Done testing!")
        break