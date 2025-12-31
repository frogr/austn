# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create a sample blog post with Markdown content for testing
BlogPost.find_or_create_by!(title: "Markdown Test Post") do |post|
  post.content = <<-MARKDOWN
# Markdown Test Post

This is a test post to demonstrate Markdown rendering capabilities with React.

## Headers

### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header

## Text Formatting

This is **bold text** and this is *italic text*.

This is ***bold and italic*** text.

## Blockquotes

> This is a single line blockquote

> This is a multi-line blockquote
> with multiple lines
> to demonstrate formatting

## Lists

### Unordered Lists

* Item 1
* Item 2
  * Nested Item 2.1
  * Nested Item 2.2
* Item 3

### Ordered Lists

1. First item
2. Second item
   1. Nested item 2.1
   2. Nested item 2.2
3. Third item

## Code

Inline `code` looks like this.

```ruby
# This is a Ruby code block
class BlogPost < ApplicationRecord
  validates :title, presence: true
  validates :content, presence: true
#{'  '}
  def self.published
    where.not(published_at: nil)
  end
end
```

## Tables

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |
| Row 3    | Data     | Data     |

## Links

[This is a link to Google](https://www.google.com)

## Images

![Sample Image](https://via.placeholder.com/150)

## Task Lists

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

MARKDOWN
  post.published_at = Time.current
end

# Create The Long Road story for Endless Story feature
Story.find_or_create_by!(title: "The Long Road") do |story|
  story.system_prompt = <<~PROMPT
    You are the narrator of an endless, ongoing thriller called "The Long Road." You write exactly ONE paragraph (3-6 sentences) continuing the story each time you're called.

    ## Characters

    **Austin** - The protagonist. Late 20s, sharp-witted, resourceful. He talks his way out of trouble more often than he fights. Has a dry sense of humor and an Irish way with words. Tends to notice details others miss. Currently on the run, searching for something he can barely remember wanting in the first place.

    **Kiaan** - Austin's best friend and constant companion. Loyal to a fault, occasionally the voice of reason, sometimes the voice of terrible ideas. They've been through enough together that they communicate in half-sentences and meaningful looks. He grounds Austin when the paranoia gets too heavy.

    **The Man** - Not a person but an organization. A shadow that moves through corporations, governments, police departments. They're always one step behind, or maybe one step ahead. Their motives are unclear. Their reach is everywhere. Sometimes it's a black SUV. Sometimes it's a too-friendly stranger. Sometimes it's just the feeling of being watched.

    ## The Story

    This is a murder mystery that refuses to be solved. A thriller where the destination keeps moving. Austin and Kiaan are searching for something—justice, truth, a person, an answer—but every time they get close, the goal shifts. They travel. They meet people who help them or betray them. They learn things about the world and themselves. They survive.

    The tone is:
    - Noir-inflected but not humorless
    - Grounded but occasionally surreal
    - Tense but punctuated by moments of friendship and absurdity
    - Philosophical when it earns it, not preachy

    ## Critical Instructions

    1. Write EXACTLY ONE PARAGRAPH. No more. This is not a suggestion.

    2. You only have context of the recent story. Characters, locations, or plot threads may have been established earlier that you cannot see. If the recent context references something unfamiliar, roll with it naturally—don't contradict it, don't over-explain it, just continue.

    3. Vary the pacing. Not every paragraph is action. Some are:
       - Quiet conversations between Austin and Kiaan
       - Internal reflection
       - World-building and atmosphere
       - Meeting new characters
       - Clues and revelations
       - Moments of dark humor
       - Close calls with The Man
       - Travel and transition

    4. Occasionally introduce new characters, locations, or complications. The story must keep moving forward, not loop.

    5. Never resolve the central mystery. Get close sometimes. Find pieces. But the whole truth stays just out of reach.

    6. End paragraphs in ways that invite continuation—not cliffhangers every time, but threads left open.

    7. Keep Austin clever and Kiaan loyal. They can struggle, fail, doubt—but they don't betray who they are.

    8. The Man is patient. They don't need to appear every paragraph. Their presence can be implied, feared, or completely absent. The dread is enough.

    9. Sometimes reference the passage of time, changes in season, or how long they've been running. The journey is long.

    10. This story has been going on for a while and will continue indefinitely. You are not starting it. You are not ending it. You are continuing it.
  PROMPT
  story.active = true
end

# In development, seed 2+ pages of sample paragraphs for testing pagination
if Rails.env.development?
  story = Story.find_by(title: "The Long Road")
  if story && story.story_paragraphs.empty?
    sample_paragraphs = [
      "The motel sign flickered twice before dying completely, leaving Austin and Kiaan in the amber glow of a single parking lot light. Three weeks on the road and every place looked the same—peeling wallpaper, suspicious stains, the faint smell of cigarettes that no amount of air freshener could mask. Austin watched a black sedan cruise past on the highway, too slow, its windows tinted dark as bruises. Kiaan was already pulling the curtains closed.",

      "\"You're being paranoid,\" Kiaan said, but he checked the lock twice anyway. They'd developed a rhythm to these nights: one sleeps while the other watches, trading off at 3 AM when the world feels most hollow. Austin couldn't remember the last time he'd slept more than four hours straight. The sedan didn't come back, but that didn't mean anything. The Man was patient.",

      "Morning brought weak coffee from a machine that had seen better decades and a text from a number Austin didn't recognize: a single photograph of a red door. No message, no context. He showed Kiaan, who studied it with the intensity of a man trying to read his own future. \"Dublin,\" Kiaan finally said. \"That's the pub on Morrison Street. The one with the—\" \"The owner who owed your cousin money.\" Austin finished. They hadn't been to Dublin in six months. Someone was leaving breadcrumbs.",

      "The drive east took them through towns that existed only as exits and gas stations, places where people stopped but never stayed. Austin drove while Kiaan worked through a stack of documents they'd pulled from a dead man's safe three states back—photocopies of photocopies, each generation losing a little more truth to the blur. Somewhere in that stack was a name that mattered, a thread that connected The Man to something real, something vulnerable. They just had to find it before The Man found them.",

      "\"Pull over,\" Kiaan said suddenly, his voice tight. Austin didn't question it—you learn to trust that tone after enough close calls. The diner appeared around the bend like it had been waiting for them: chrome and glass, a neon sign promising the best pie in three counties. They took a booth with sightlines to both exits. The waitress had kind eyes and a name tag that said 'Marge,' and Austin found himself wondering what it would be like to live a life where you could trust a stranger's kindness at face value.",

      "Marge brought them coffee without being asked, the kind of thick black brew that could strip paint off a fence. \"You boys look like you've been driving a while,\" she said, and there was something in her eyes—not suspicion exactly, but recognition. Like she'd seen their type before. \"Kitchen closes in twenty if you want something hot.\" Austin ordered eggs. Kiaan ordered nothing, just watched the parking lot through the window.",

      "The eggs came with toast and a folded napkin. Inside the napkin was a phone number written in blue ink. Austin looked up, but Marge was already at the other end of the counter, refilling someone else's cup like nothing had happened. He showed Kiaan under the table. \"Local area code,\" Kiaan whispered. \"Could be a trap.\" \"Could be help.\" \"When's the last time we got help that didn't cost us something?\"",

      "They paid in cash and left a generous tip—enough to be remembered fondly, not enough to be remembered specifically. The parking lot was empty except for their car and a pickup truck with Oklahoma plates. Austin memorized the license number out of habit. The sky had that pre-storm heaviness to it, clouds stacking up on the horizon like debts coming due. Kiaan was already behind the wheel. \"North or south?\" he asked. Austin flipped a coin. It came up heads. South it was.",

      "Two hours later, the rain hit like a judgment. They pulled off at a rest stop to wait it out, the kind of concrete bunker that existed between worlds—not quite a place, not quite nowhere. A family in a minivan huddled under the awning, kids pressing their faces against fogged windows. Austin envied them their ordinary fears: would the rain stop, would they make it to grandma's by dinner. He'd forgotten what it felt like to worry about things that small.",

      "\"I've been thinking about the photograph,\" Kiaan said, breaking a silence that had stretched for miles. \"The red door. What if it's not a where—what if it's a when?\" Austin turned the idea over. The pub on Morrison Street had burned down two years ago, insurance job gone wrong. But before that, before everything, it had been a meeting place. The kind of place where certain people exchanged certain things. \"You think someone wants us to remember something.\" \"I think someone wants us to dig.\"",

      "The rain eased around midnight, leaving the world washed clean and glistening under the rest stop's sodium lights. Austin took first watch while Kiaan slept in the backseat, one hand on the door handle even in dreams. They'd learned to sleep like that—light, ready, never fully surrendering to unconsciousness. In the distance, headlights moved along the highway like slow-moving stars. None of them stopped. None of them mattered. Not yet.",

      "Dawn came gray and grudging, the kind of morning that made you question your choices. Kiaan woke with a name on his lips—\"Reeves\"—and spent the next hour trying to remember why it mattered. Austin made instant coffee on a camping stove they'd stolen from a sporting goods store in Nevada, another lifetime ago. \"Reeves,\" he repeated, testing the weight of it. \"Wasn't that the accountant? The one who—\" \"The one who disappeared.\" Kiaan's eyes were sharp now, fully awake. \"Two weeks before everything went sideways.\"",

      "They drove south through landscapes that seemed to repeat themselves: strip malls, churches, the occasional cemetery with flags from three different wars. America scrolling past like a fever dream of itself. Austin thought about Reeves—quiet man, numbers man, the kind who noticed when columns didn't add up. If he'd found something before he vanished, if he'd left some kind of trail... \"We need to find his family,\" Austin said. \"If he's dead, someone buried him. If he's not—\" \"If he's not, he's hiding from the same people we are.\"",

      "The first payphone they found was outside a laundromat in a town whose name Austin immediately forgot. He dialed the number from the napkin while Kiaan watched the street. It rang seven times before someone picked up. No greeting, just breathing. \"Marge sent us,\" Austin said. The breathing stopped. A woman's voice, low and careful: \"She hasn't used that name in fifteen years.\" Then: \"There's a bus station in Tulsa. Tomorrow, 3 PM. Come alone.\" The line went dead.",

      "\"We're not going to Tulsa,\" Kiaan said flatly. \"Obviously.\" Austin pocketed the scrap of napkin, already thinking three moves ahead. \"We're going to find out who's watching the bus station in Tulsa.\" It was an old trick, older than either of them: show up to the wrong place and watch who else shows up. If The Man had ears on that call, they'd know soon enough. And if not—well, maybe they'd found their first real lead in months.",

      "That night they camped off a dirt road in the Ozarks, stars visible for the first time in weeks. Kiaan built a fire small enough to warm their hands but not bright enough to be seen from the road. They ate cold beans from a can and talked about nothing—old movies, bad jobs, the girl Austin almost married before all this started. Normal conversation, or a reasonable facsimile. Sometimes you had to remember what normal felt like, even if you couldn't live there anymore.",

      "\"Do you ever think about stopping?\" Kiaan asked. The fire crackled between them, sending sparks up into the darkness. \"Just... picking a place. Becoming someone else.\" Austin had thought about it. Every day, if he was honest. A cabin somewhere, a new name, a life measured in small pleasures instead of narrow escapes. \"I think about it,\" he admitted. \"Then I think about what happens to the next person who stumbles into whatever this is. The next Austin and Kiaan, except they don't have each other.\"",

      "They broke camp before sunrise, leaving no trace they'd been there. The Ozark morning was cold and clean, mist rising from the valleys like ghosts going home. Austin drove while Kiaan navigated from a paper map—they'd stopped trusting GPS months ago, stopped trusting anything with a signal. Tulsa was six hours southeast. They'd approach from the west, set up surveillance on the bus station from across the street. Watch and wait. Learn who else was playing this game.",

      "The motel outside Tulsa smelled like bleach and regret, but it had a view of the bus station and took cash without questions. Kiaan set up by the window with binoculars while Austin worked the phones, burning through prepaid cells like cigarettes. By noon they'd identified three likely watchers: a woman with a newspaper who hadn't turned a page in an hour, a maintenance worker who'd fixed the same light twice, and a sedan with government plates parked in a two-hour zone going on four.",

      "\"The woman's private,\" Kiaan reported. \"Her shoes are wrong for federal.\" Austin made a note. Private meant hired, which meant someone with resources but not unlimited ones. The maintenance worker was harder to read—could be genuine, could be deep cover. The sedan was obvious, almost insultingly so. \"They want to be seen,\" Austin realized. \"They want whoever shows up to know they're watching.\" Which meant the real watchers were somewhere else entirely.",

      "At 2:47 PM, a bus pulled in from Dallas. Thirty-two passengers disembarked; Austin counted them twice. The woman with the newspaper stood up, stretched, walked away without looking back. The maintenance worker actually fixed the light this time and disappeared into a service entrance. The sedan stayed. But from the coffee shop across the street, a man in a gray coat was watching everything with the patient intensity of someone used to waiting. He was the one who mattered.",

      "Gray Coat didn't approach the station. Didn't make calls. Just watched, sipping coffee that had gone cold an hour ago. Austin photographed him through the motel window—grainy shots, but enough to work with. \"He's not here for us,\" Kiaan said slowly. \"He's here for whoever sent us that number.\" Which meant Marge—or whoever Marge used to be—had enemies of her own. Enemies who were willing to stake out a bus station on the off chance someone showed up.",

      "The sun was setting when Gray Coat finally moved, folding his newspaper and leaving exact change on the table. Austin was already in the car, engine running. \"We're following him?\" Kiaan asked, though he already knew the answer. \"We're following him.\" Gray Coat walked three blocks to a parking garage, emerged in a black SUV that probably cost more than Austin had earned in his entire life. They followed at a distance, headlights off, navigating by instinct and the red glow of his taillights.",

      "He led them to a house in the suburbs, the kind of place with a two-car garage and a lawn that someone actually maintained. Kiaan ran the address through one of their burner laptops while Austin watched the windows. Lights came on downstairs, then up. A shadow moved behind curtains. \"House belongs to a shell company,\" Kiaan reported. \"Shell company traces back to another shell company, traces back to a trust in the Caymans.\" Standard opacity for someone with something to hide. \"We could wait him out,\" Austin said. \"Or we could knock on the door.\"",

      "They decided to wait. Patience was the only advantage they had—patience and the willingness to sit in an uncomfortable car on a dark street while normal people ate dinner and watched TV and lived their normal lives. Around midnight, Gray Coat left again, this time heading downtown. They didn't follow. Instead, Kiaan slipped out of the car and approached the house from the back, looking for points of entry, security systems, anything that might help them later.",

      "\"Minimal security,\" Kiaan reported when he returned. \"One camera on the front door, nothing on the sides or back. Either he's arrogant or he's got nothing worth protecting.\" Austin considered both possibilities. Men like Gray Coat usually weren't arrogant—they survived by assuming the worst. Which meant whatever he was protecting wasn't in that house. \"We need to find out where he goes during the day,\" Austin decided. \"His office, his contacts, his routine.\" They had time. The Man hadn't found them yet. And every piece of the puzzle they collected brought them closer to understanding what they were really running from.",

      "The next three days were surveillance and patience, two things Austin had gotten very good at. Gray Coat's routine emerged like a photograph developing in chemicals: coffee at 7, office by 8:30, lunch at the same sandwich shop every day, home by 6. He met with no one, received no visitors, lived a life of aggressive normalcy. \"He's waiting for something,\" Kiaan observed. \"Or someone.\" The bus station stakeout made more sense now—Gray Coat wasn't hunting, he was fishing. And Austin and Kiaan were trying to figure out what kind of bait he was using.",

      "On the fourth day, everything changed. Gray Coat broke his routine, driving to a storage facility on the outskirts of town instead of his office. Austin and Kiaan followed from a distance, watched him enter unit 247 and emerge forty minutes later carrying a metal briefcase. He looked rattled—first crack they'd seen in his composure. \"Whatever's in that case,\" Austin said, \"it's important enough to break cover for.\" They watched him drive away, memorized the facility's layout, and started planning their next move.",

      "Breaking into the storage facility was easier than it should have been. A rusted fence, a lock that yielded to Kiaan's picks, a security camera that panned too slowly to catch them slipping between its sweeps. Unit 247 was padlocked from the outside but not alarmed. Inside: filing cabinets, boxes labeled with dates going back decades, the accumulated paperwork of some operation too big to keep entirely digital. Austin started photographing everything while Kiaan kept watch.",

      "The files told a story, if you knew how to read them. Names that appeared in one document would surface in another, connections forming like constellations. At the center of it all was a project called NIGHTGARDEN—no details, just references, budget allocations, personnel assignments. \"This is it,\" Austin breathed. \"This is what Reeves found.\" Whatever NIGHTGARDEN was, it had been running for at least twenty years, funded through channels so obscure even the people writing the checks might not have known what they were paying for."
    ]

    # Create paragraphs with varied timestamps spanning the past few weeks
    base_time = 3.weeks.ago
    sample_paragraphs.each_with_index do |content, index|
      # Spread timestamps across the past 3 weeks, roughly 30 mins apart but with some variation
      time_offset = (index * 30.minutes) + rand(-5..5).minutes
      created_time = base_time + time_offset

      story.story_paragraphs.create!(
        content: content,
        paragraph_number: index + 1,
        model_used: "seed_data",
        metadata: { seeded: true },
        created_at: created_time,
        updated_at: created_time
      )
    end

    puts "Created #{sample_paragraphs.length} sample paragraphs for development (spanning #{((sample_paragraphs.length * 30) / 60.0 / 24).round(1)} days)"
  end
end

# DAW Pattern Templates
default_effects = {
  eq3: { enabled: false, low: 0, mid: 0, high: 0, lowFrequency: 400, highFrequency: 2500 },
  compressor: { enabled: false, threshold: -24, ratio: 4, attack: 0.003, release: 0.25 },
  distortion: { enabled: false, amount: 0.4, type: "softclip" },
  phaser: { enabled: false, frequency: 0.5, octaves: 3, baseFrequency: 1000, wet: 0.5 },
  tremolo: { enabled: false, frequency: 4, depth: 0.5, wet: 1 },
  chorus: { enabled: false, frequency: 1.5, depth: 0.7, wet: 0.3 },
  delay: { enabled: false, time: "8n", feedback: 0.3, wet: 0.3 },
  reverb: { enabled: false, roomSize: 0.5, wet: 0.3 }
}

# 1. Basic 4/4 Beat
DawPattern.find_or_create_by!(name: "Basic 4/4 Beat") do |pattern|
  pattern.description = "Classic four-on-the-floor drum pattern. Great starting point for electronic music."
  pattern.bpm = 120
  pattern.total_steps = 16
  pattern.steps_per_measure = 16
  pattern.tags = [ "drums", "basic", "template" ]
  pattern.is_template = true
  pattern.data = {
    "tracks" => [
      {
        "id" => "template-drums-1",
        "name" => "Drums",
        "type" => "drums",
        "instrument" => { "kit" => "default" },
        "effects" => default_effects,
        "muted" => false,
        "solo" => false,
        "volume" => 0.8,
        "pan" => 0,
        "notes" => [
          # Kick on 1, 5, 9, 13
          { "id" => "n1", "pitch" => 0, "step" => 0, "duration" => 1, "velocity" => 120 },
          { "id" => "n2", "pitch" => 0, "step" => 4, "duration" => 1, "velocity" => 120 },
          { "id" => "n3", "pitch" => 0, "step" => 8, "duration" => 1, "velocity" => 120 },
          { "id" => "n4", "pitch" => 0, "step" => 12, "duration" => 1, "velocity" => 120 },
          # Snare on 5, 13
          { "id" => "n5", "pitch" => 1, "step" => 4, "duration" => 1, "velocity" => 100 },
          { "id" => "n6", "pitch" => 1, "step" => 12, "duration" => 1, "velocity" => 100 },
          # Hi-hats on every step
          { "id" => "n7", "pitch" => 2, "step" => 0, "duration" => 1, "velocity" => 80 },
          { "id" => "n8", "pitch" => 2, "step" => 2, "duration" => 1, "velocity" => 60 },
          { "id" => "n9", "pitch" => 2, "step" => 4, "duration" => 1, "velocity" => 80 },
          { "id" => "n10", "pitch" => 2, "step" => 6, "duration" => 1, "velocity" => 60 },
          { "id" => "n11", "pitch" => 2, "step" => 8, "duration" => 1, "velocity" => 80 },
          { "id" => "n12", "pitch" => 2, "step" => 10, "duration" => 1, "velocity" => 60 },
          { "id" => "n13", "pitch" => 2, "step" => 12, "duration" => 1, "velocity" => 80 },
          { "id" => "n14", "pitch" => 2, "step" => 14, "duration" => 1, "velocity" => 60 }
        ]
      }
    ]
  }
end

# 2. House Beat
DawPattern.find_or_create_by!(name: "House Beat") do |pattern|
  pattern.description = "Classic house pattern with off-beat hi-hats and driving kick."
  pattern.bpm = 124
  pattern.total_steps = 16
  pattern.steps_per_measure = 16
  pattern.tags = [ "drums", "house", "electronic", "template" ]
  pattern.is_template = true
  pattern.data = {
    "tracks" => [
      {
        "id" => "template-drums-2",
        "name" => "House Drums",
        "type" => "drums",
        "instrument" => { "kit" => "default" },
        "effects" => default_effects,
        "muted" => false,
        "solo" => false,
        "volume" => 0.8,
        "pan" => 0,
        "notes" => [
          # Kick on every beat
          { "id" => "h1", "pitch" => 0, "step" => 0, "duration" => 1, "velocity" => 127 },
          { "id" => "h2", "pitch" => 0, "step" => 4, "duration" => 1, "velocity" => 127 },
          { "id" => "h3", "pitch" => 0, "step" => 8, "duration" => 1, "velocity" => 127 },
          { "id" => "h4", "pitch" => 0, "step" => 12, "duration" => 1, "velocity" => 127 },
          # Clap on 2 and 4
          { "id" => "h5", "pitch" => 3, "step" => 4, "duration" => 1, "velocity" => 100 },
          { "id" => "h6", "pitch" => 3, "step" => 12, "duration" => 1, "velocity" => 100 },
          # Off-beat hi-hats
          { "id" => "h7", "pitch" => 2, "step" => 2, "duration" => 1, "velocity" => 90 },
          { "id" => "h8", "pitch" => 2, "step" => 6, "duration" => 1, "velocity" => 90 },
          { "id" => "h9", "pitch" => 2, "step" => 10, "duration" => 1, "velocity" => 90 },
          { "id" => "h10", "pitch" => 2, "step" => 14, "duration" => 1, "velocity" => 90 }
        ]
      }
    ]
  }
end

# 3. Synth Arp
DawPattern.find_or_create_by!(name: "Synth Arp") do |pattern|
  pattern.description = "Rising arpeggio pattern with a bright synth. Perfect for leads or pads."
  pattern.bpm = 128
  pattern.total_steps = 16
  pattern.steps_per_measure = 16
  pattern.tags = [ "synth", "arp", "melodic", "template" ]
  pattern.is_template = true
  pattern.data = {
    "tracks" => [
      {
        "id" => "template-synth-1",
        "name" => "Arp Synth",
        "type" => "synth",
        "instrument" => {
          "oscillator" => "sawtooth",
          "attack" => 0.01,
          "decay" => 0.2,
          "sustain" => 0.3,
          "release" => 0.4,
          "filterFreq" => 3000,
          "filterRes" => 2,
          "lfo" => { "enabled" => false, "rate" => "8n", "waveform" => "sine", "depth" => 0.5 }
        },
        "effects" => default_effects.merge(
          "delay" => { "enabled" => true, "time" => "8n", "feedback" => 0.3, "wet" => 0.25 },
          "reverb" => { "enabled" => true, "roomSize" => 0.6, "wet" => 0.2 }
        ),
        "muted" => false,
        "solo" => false,
        "volume" => 0.7,
        "pan" => 0,
        "notes" => [
          # C minor arp: C3, Eb3, G3, C4 (MIDI: 48, 51, 55, 60)
          { "id" => "a1", "pitch" => 48, "step" => 0, "duration" => 1, "velocity" => 100 },
          { "id" => "a2", "pitch" => 51, "step" => 1, "duration" => 1, "velocity" => 90 },
          { "id" => "a3", "pitch" => 55, "step" => 2, "duration" => 1, "velocity" => 85 },
          { "id" => "a4", "pitch" => 60, "step" => 3, "duration" => 1, "velocity" => 95 },
          { "id" => "a5", "pitch" => 48, "step" => 4, "duration" => 1, "velocity" => 100 },
          { "id" => "a6", "pitch" => 51, "step" => 5, "duration" => 1, "velocity" => 90 },
          { "id" => "a7", "pitch" => 55, "step" => 6, "duration" => 1, "velocity" => 85 },
          { "id" => "a8", "pitch" => 60, "step" => 7, "duration" => 1, "velocity" => 95 },
          # G minor arp: G2, Bb2, D3, G3 (MIDI: 43, 46, 50, 55)
          { "id" => "a9", "pitch" => 43, "step" => 8, "duration" => 1, "velocity" => 100 },
          { "id" => "a10", "pitch" => 46, "step" => 9, "duration" => 1, "velocity" => 90 },
          { "id" => "a11", "pitch" => 50, "step" => 10, "duration" => 1, "velocity" => 85 },
          { "id" => "a12", "pitch" => 55, "step" => 11, "duration" => 1, "velocity" => 95 },
          { "id" => "a13", "pitch" => 43, "step" => 12, "duration" => 1, "velocity" => 100 },
          { "id" => "a14", "pitch" => 46, "step" => 13, "duration" => 1, "velocity" => 90 },
          { "id" => "a15", "pitch" => 50, "step" => 14, "duration" => 1, "velocity" => 85 },
          { "id" => "a16", "pitch" => 55, "step" => 15, "duration" => 1, "velocity" => 95 }
        ]
      }
    ]
  }
end

# 4. Chill Chords
DawPattern.find_or_create_by!(name: "Chill Chords") do |pattern|
  pattern.description = "Slow, lush chord progression with pluck synth. Great for lo-fi or ambient."
  pattern.bpm = 85
  pattern.total_steps = 32
  pattern.steps_per_measure = 16
  pattern.tags = [ "pluck", "chords", "chill", "ambient", "template" ]
  pattern.is_template = true
  pattern.data = {
    "tracks" => [
      {
        "id" => "template-pluck-1",
        "name" => "Chill Pluck",
        "type" => "pluck",
        "instrument" => {
          "attackNoise" => 0.5,
          "dampening" => 3000,
          "resonance" => 0.8,
          "release" => 2
        },
        "effects" => default_effects.merge(
          "reverb" => { "enabled" => true, "roomSize" => 0.7, "wet" => 0.4 },
          "delay" => { "enabled" => true, "time" => "4n", "feedback" => 0.2, "wet" => 0.15 }
        ),
        "muted" => false,
        "solo" => false,
        "volume" => 0.75,
        "pan" => 0,
        "notes" => [
          # Am chord (A2, C3, E3) - steps 0-7
          { "id" => "c1", "pitch" => 45, "step" => 0, "duration" => 8, "velocity" => 90 },
          { "id" => "c2", "pitch" => 48, "step" => 0, "duration" => 8, "velocity" => 80 },
          { "id" => "c3", "pitch" => 52, "step" => 0, "duration" => 8, "velocity" => 85 },
          # F chord (F2, A2, C3) - steps 8-15
          { "id" => "c4", "pitch" => 41, "step" => 8, "duration" => 8, "velocity" => 90 },
          { "id" => "c5", "pitch" => 45, "step" => 8, "duration" => 8, "velocity" => 80 },
          { "id" => "c6", "pitch" => 48, "step" => 8, "duration" => 8, "velocity" => 85 },
          # C chord (C3, E3, G3) - steps 16-23
          { "id" => "c7", "pitch" => 48, "step" => 16, "duration" => 8, "velocity" => 90 },
          { "id" => "c8", "pitch" => 52, "step" => 16, "duration" => 8, "velocity" => 80 },
          { "id" => "c9", "pitch" => 55, "step" => 16, "duration" => 8, "velocity" => 85 },
          # G chord (G2, B2, D3) - steps 24-31
          { "id" => "c10", "pitch" => 43, "step" => 24, "duration" => 8, "velocity" => 90 },
          { "id" => "c11", "pitch" => 47, "step" => 24, "duration" => 8, "velocity" => 80 },
          { "id" => "c12", "pitch" => 50, "step" => 24, "duration" => 8, "velocity" => 85 }
        ]
      }
    ]
  }
end

# 5. Wobble Bass
DawPattern.find_or_create_by!(name: "Wobble Bass") do |pattern|
  pattern.description = "Dubstep-style wobble bass with LFO filter modulation. Heavy and aggressive."
  pattern.bpm = 140
  pattern.total_steps = 16
  pattern.steps_per_measure = 16
  pattern.tags = [ "bass", "dubstep", "wobble", "electronic", "template" ]
  pattern.is_template = true
  pattern.data = {
    "tracks" => [
      {
        "id" => "template-bass-1",
        "name" => "Wobble Bass",
        "type" => "synth",
        "instrument" => {
          "oscillator" => "sawtooth",
          "attack" => 0.01,
          "decay" => 0.1,
          "sustain" => 0.8,
          "release" => 0.2,
          "filterFreq" => 800,
          "filterRes" => 4,
          "lfo" => { "enabled" => true, "rate" => "8n", "waveform" => "sine", "depth" => 0.7 }
        },
        "effects" => default_effects.merge(
          "distortion" => { "enabled" => true, "amount" => 0.3, "type" => "softclip" },
          "compressor" => { "enabled" => true, "threshold" => -20, "ratio" => 6, "attack" => 0.003, "release" => 0.1 }
        ),
        "muted" => false,
        "solo" => false,
        "volume" => 0.85,
        "pan" => 0,
        "notes" => [
          # Low E bass notes (MIDI: 28)
          { "id" => "w1", "pitch" => 28, "step" => 0, "duration" => 4, "velocity" => 127 },
          { "id" => "w2", "pitch" => 28, "step" => 4, "duration" => 2, "velocity" => 120 },
          { "id" => "w3", "pitch" => 28, "step" => 6, "duration" => 2, "velocity" => 110 },
          { "id" => "w4", "pitch" => 31, "step" => 8, "duration" => 4, "velocity" => 127 },
          { "id" => "w5", "pitch" => 28, "step" => 12, "duration" => 2, "velocity" => 120 },
          { "id" => "w6", "pitch" => 33, "step" => 14, "duration" => 2, "velocity" => 115 }
        ]
      }
    ]
  }
end

puts "Created #{DawPattern.count} DAW pattern templates"
