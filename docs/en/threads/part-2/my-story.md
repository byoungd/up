---
title: "My Story: Failure, Recovery, and Starting Again"
description: A personal record of a software-company failure, disrupted health and life, recovery at home, and reconnecting with technology.
updated: 2026-09-01
---

# My Story: Failure, Recovery, and Starting Again

> Content note: this chapter includes business failure, prolonged insomnia, severe stress, and past suicidal thoughts. It is a personal account, not medical, mental-health, legal, or financial advice. If you are in immediate danger, contact someone you trust and qualified local support first. If reading becomes distressing, pause and ask someone trustworthy to stay with you.

## Narrative Boundary

This is a memory written from my position, not a shared version from everyone involved. Partners, colleagues, and friends are anonymised or described generally; details about the child and other third parties are kept only when needed to understand the event. Dates, amounts, and physical experiences come from my records and memory and may contain error. Emotional interpretation is not a factual judgment about another person. Photographs and stories involving others remain only with necessary permission and respect for deletion requests.

If you want to treat this memory as learning material, read [Narrative and Evidence: Do Not Turn Experience into Fate](narrative-and-evidence.md) first, then return to ask which parts are facts, which are my interpretations, and which conclusions must remain open.

## What Failure Cost Me

Hi, I’m Li Pu. This is the story of one particularly absurd chapter of my life in the internet industry.

On April 1, 2017, I joined a tech company in Nanjing as a regular front-end developer. We were building software for lawyers and law firms. The first version had been outsourced. The code had no comments, no project management, and no real structure. To make things worse, there was no product manager. Most product ideas came directly from the boss’s intuition.

In my first month there, the timeline module I was responsible for was revised more than twenty times. That level of churn was exhausting.

Still, a month later, the first version finally went into testing and roughly matched what the boss wanted. After that, I led a front-end rewrite based on Vue. We spent more than half a year rebuilding it and eventually shipped. Sales started, and we thought the product would at least make some noise in the industry. It did not. For a long time, we could not close a single deal.

![Office environment](../../../assets/company.jpeg)

As the company struggled, salaries did not grow with time. A lot of people left. Watching old coworkers leave one after another, often with deep resentment toward the company, felt terrible.

From the beginning, I truly believed in the product. Even as the team turned over again and again, and even though my pay did not increase at all in those early years, I chose to stay.

Eventually, I became one of only two people who stayed throughout the whole journey. I went from an ordinary employee to department leader, then general manager, and step by step toward becoming a partner.

That was how the absurd story really began.

To devote myself fully to work, there was one part of life I cannot leave out: love.

### Love

I was lucky enough to meet someone I truly loved at the right age. Her name was Ruohan (a pseudonym). In [this guide, then called *English-level-up-tips*](https://github.com/byoungd/up), I once used Gu Cheng’s words to describe how I felt when I first met her:

> The grass is bearing its seeds.  
> The wind is shaking its leaves.  
> We stand together, saying nothing, and that is already beautiful.

On August 19, 2017, I went with her to Shanghai for something deeply significant. We took many photos on the Bund that day. Even now, whenever I see those photos, I still feel like crying. To this day, if they appear on my phone, I quickly scroll past them on purpose. I still do not have the courage to relive that pain.

That night was beautiful, but the air was heavy with pressure. Looking at the rows of bank buildings on the Bund and enjoying the night breeze, we both tried hard not to let the other person feel our emotions sinking, because we both knew that something was happening and there was nothing we could do about it.

At one point, while I was talking with great confidence about our bright future, she suddenly cried. Not loudly. Silently. I only realized it after she had been crying for a while. She seemed to understand that the future I was describing might not really have a place for her. She turned away from me, and in that moment I saw her vulnerability.

That was also the moment I realised I truly loved her, and began to understand that love is not designing happiness for another person. It is choosing to face uncertainty together.

#### If Love Has an Echo

Later, we got married and had a lovely son.

Later, in order to expand my business world, I also tried hot spring resorts and private club projects. I lost heavily there too, but that is another story.

![Some of the ventures I tried](../../../assets/things.jpeg)

![Resort project](../../../assets/car.jpeg)

### Food Business

One of my relatives opened a Huainan beef soup shop in Nanjing and did very well. Later my cousin opened a second one, and business was extremely good. After studying the category a bit, I opened one myself, and it performed far better than I had expected.

Then I started handling the design, renovation, and branding choices myself, and gradually expanded the product range. I opened a second store, then a third.

![The workstation I built for myself](../../../assets/desk.jpeg)

To make the products look better on food delivery platforms, I taught myself photography and Photoshop and created a full set of product images by hand.

![Food product photo](../../../assets/nrt.webp)

Those small food businesses were genuinely exhausting, but the cash flow was strong. Although those stores gradually shut down during the pandemic years, they made me a decent amount of money before that. That money later became part of the capital that allowed me to become a partner in the software company. During that period, I also bought my Dream Car.

### Running the Company

Once the company’s income and expenses were roughly balanced, we moved into a bigger office. Standing in front of an unfinished display wall, I imagined a very good future.

![New office](../../../assets/office.jpg)

To create a better working environment, I hired more young staff, improved employee benefits step by step, and organized dinners and hangouts every so often.

The photo above is a precious picture of me with our front-end leader, Nas.

But the good period did not last long. Starting in early 2022, software sales fell off a cliff, and we could not find a solution. I had never been truly satisfied with the product. It was huge, bloated, and full of bugs. Frankly speaking, it was a mess. Customers said there was a bug every three steps and called it garbage. If the price had not been so low, some of them might have sued us.

![Product page](../../../assets/product1.webp)

To solve some core problems, I brought in my high school deskmate, who was then doing container security at ByteDance. He had always been someone special in my mind. After he joined us, he discovered some extremely serious issues.

![Product design draft](../../../assets/product-ds.webp)

First, the project structure was outdated, and many parts had serious performance and security problems. Second, some of the “AI” features were not generated through any actual model training at all. They were basically powered by Elasticsearch search behavior. We had spent years talking about big data, but in reality a lot of it was just preset outputs wrapped around business requirements.

That meant what we had been treating as core assets were, in truth, mostly junk. Meanwhile, we had spent most of our time on multi-platform adaptation, UI polish, and stuffing the product with miscellaneous features.

We kept iterating on UI and experience details, but the real problem was that there was no usable dataset. The so-called big data extraction had no meaningful training samples behind it, which meant nothing real could be trained.

In other words, the team that had been “doing big data” for years had never even built the dataset properly.

When I realized how serious that was, I felt a chill down my back.

At that stage, we were trapped. Continuing to iterate on the old foundation meant staying in a total garbage pile of code that was almost impossible to move. Rebuilding it would require far more money than the company still had.

One night I stayed late in the office discussing this with the other two partners. Mr. Gong, our largest shareholder, was close to breaking and kept asking whether the project could still be done.

I understood his emotions. He had already put more than ten million RMB into the company, all of it his own money. Not a single cent came from outside investors. I had also put in several million myself. It is hard to describe how everyone felt at that point.

Later, he slammed his forty-page employee management handbook onto the meeting table like a madman. The sound was so loud it felt like the office might collapse. In truth, some things had already become impossible to continue. We were just still holding onto illusions.

As the company’s losses got worse, we could no longer pay salaries properly. We tried everything to find money, including borrowing. Under extreme pressure, Mr. Gong started tightening attendance rules, cutting benefits, pushing meaningless overtime, and even monitoring employees’ work. Weekly reports became daily reports, then hourly reports. The team was being disgusted by one new control tactic after another.

I knew the team breaking apart was only a matter of time. I strongly opposed these performative management methods, but one sentence shut me down:

> “I put in the most money. I make the decisions.”

By September, the atmosphere was so bad that nobody wanted to come to work anymore. Then people resigned together, and that was the end of the game.

The company collapsed. Leave aside the money for a moment. I had given five or six years of my life to it. How could I forget all those days and nights spent rushing projects? On top of that, I had dragged my deskmate into this mess. If he had stayed at ByteDance, maybe he would have had a much better future.

I used to imagine all of us celebrating success together one day, drinking and laughing. Instead, everything went the other way.

After the company shut down, I did not even have the courage to apologize to him. I felt awful inside, and I had no way to explain it to anyone. When I think about all those teammates who fought alongside me, I remember the times we cheered over difficult breakthroughs, the nights we were so excited we could not sleep, the promises I made, and the grand words I spoke in meetings.

I still feel deeply guilty.

To them, I just want to say:

> I’m so sorry.

Even though they may never see this.

### When My Body Broke Down

Starting in June, because of severe conflicts with Mr. Gong over how the company should be managed, and because my own management decisions were being overridden harshly, my body began to react.

My stomach started feeling bad. Later I developed erosive gastritis that never really healed. Then came insomnia. Then the stomach problems got worse. Then I got COVID. After that, it felt like every possible illness was landing on me at once. My vision became blurry. I lost my appetite. Long-term insomnia plus wandering pain throughout my body made me feel like I was falling apart.

One night, I suddenly told Ruohan that I thought I might not make it. Then I started talking nonsense and even began trying to explain what should happen after I died. She cried loudly enough to wake our sleeping child. I still remember the two of them crying for a long time, impossible to calm down.

In the following months, I went from one hospital in Nanjing to another. Waiting in lines, doing scans, MRIs, blood tests. I felt like a shell of myself. My whole world was wrapped in a layer of black fog.

The tests found a few minor problems, but doctors kept telling me with certainty that I was basically fine. I could not believe them. I was convinced that something serious had not been found yet. So every day became the same cycle: register, wait, get checked, wait for results, ask another doctor, rule out one disease, then look for the next one. I kept searching websites for symptoms like mine, telling myself I was okay and then doubting myself again.

Years of programming had also left me with persistent lower-back problems. That experience reminded me that the body is not an unlimited asset. Recurring symptoms deserve professional assessment and earlier care in daily work.

When people get desperate, they try everything. During that period, I visited famous traditional Chinese doctors, and my family even took me to pray and ask folk spiritual healers for help.

I knew this was not a real solution, but I still could not sleep night after night. I had no energy left at all.

The losses from our group alone were more than 20 million RMB. Once the resort and club projects were included, the pressure was enormous. At the hardest point, I even considered selling Ruohan’s family home. I never borrowed a single cent from relatives. I simply could not bring myself to ask.

I know that once certain words are spoken, relationships can change. Before borrowing money, be honest about repayment ability, relationship cost, and an exit plan; do not transfer an impossible burden to someone else.

I even considered selling the car I had bought just over a year earlier, but my family stopped me. The house was already gone. If I sold the car too, it would directly affect daily life, especially with a child going to school, and it would not even recover that much money anyway.

![My former Dream Car](../../../assets/bmw.webp)

### After Going Back Home

At the end of March 2023, I transferred away my last small food business. By the end of June, I packed everything up and returned to my hometown.

Leaving a city I had lived in for more than ten years, with my three-year-old son beside me, was painful in a quiet way.

As my physical discomfort kept getting worse, I became quieter and quieter. First I stopped wanting to go outside. Then I stopped wanting to talk. Eventually I did not even want to eat.

If my mom had not messaged me every day telling me to come eat, I probably would have skipped meals entirely.

I was nearly thirty, yet I still needed my mother to remind me to eat. It embarrassed me, but it also forced me to admit that I needed help.

I hated that version of myself too. But I felt powerless, like I was trapped in the center of a whirlpool. No matter how hard I struggled, I could not climb out.

Doing nothing for a long time is also unbearable. One day I reassembled my desktop computer and started playing *League of Legends*. I played day and night, until even I felt bored by it. But since I could not sleep anyway, I just let myself keep spiraling.

### A Life That Felt Hopeless

I lost control of my gaming. My days and nights flipped upside down, and I earned nothing. The contrast with my old modest but decent life was brutal.

When you are living off money from selling a house, sharing daily life with parents, and showing no sign of moving forward, disappointment naturally builds. She also carried great pressure and asked how long this life would continue.

I shouted back at her, “What do you want me to do?”

The truth is, I really was lost. I had no idea what to do.

The software company was gone, and with it, my life as a programmer seemed to end too. I silently left many chat groups, closed GitHub, muted some contacts, and stopped visiting websites I used to browse every single day.

During the startup years, I even fell out with my best friend, Lele, over money. So many years of friendship collapsed because of my stubbornness. We barely spoke after that. I lost a lot.

More than once, I asked myself:

> Why did I fight so hard to keep this going?

Would things have ended differently if I had made other choices? If I had worked even harder at certain turning points, would it have helped? If I had started earlier or later, would it have gone differently? If only I had...

Looking back, building industry software really cannot be done through passion and a few seemingly clever ideas alone. Every founder believes he understands the user, believes his product solves a real pain point, and believes growth will eventually explode.

But success depends on many things outside your control: timing, conditions, luck.

For example, we spent huge effort building an “intelligent Q&A bot.” If we had done that after ChatGPT arrived, it would have been an entirely different story. But in real life, you do not get to wait for a world-changing product to arrive exactly when your own company needs it.

### Reflection

If you ask me what it feels like to watch a company fail after building it with that much money and effort, I can only say this:

Falling hard while you are still young is not necessarily the worst thing. It may be only one episode in life.

That is the tough version of the answer. The honest version is simpler: it hurt deeply.

I still clearly remember my son’s birthday. Early that morning, Ruohan said, “Let’s have hotpot tonight.” I hesitated for a long time and finally said, “There’s no need. Let’s just buy a small cake and celebrate at home.”

That answer was obviously not what she expected. She went quiet and tried hard to hide her disappointment. At some point, even going out for a real meal had become something I treated as a luxury. And this was not just any day. It was supposed to be worth celebrating. I had never imagined I would reach that point.

I had never imagined I would end up in such a state. That kind of sadness is probably understood only by people who have truly fallen low.

That night we still went to Haidilao, but we barely ordered anything. When the staff sang the birthday song and got to the line about “saying goodbye to all your troubles,” I completely broke down inside.

If only it were that easy.

When family members carry pain because of your decisions, your own suffering does not cancel the guilt. A tiny, ordinary moment can shatter the armour you built for yourself, and sadness and frustration rush back at once.

## 2026-04-22 Update

A lot of people have asked how I am doing now. I’m still here, and I’m doing well.

One more thing: this article mainly records my conflict with my partner Mr. Gong (a pseudonym) during the company’s final period, so it can make him look like a single opposing figure. That is my perspective, not a complete judgment of him; he has many admirable qualities. Public writing should leave other people room not to be defined entirely by my version.

## 2026-06-16 Update

On June 16, 2026, as Chairman of China Ciyuan Cloud Computing Co., Ltd., I was invited by Alibaba in Hangzhou to visit and study at Alibaba Cloud's Hangzhou headquarters.

![Visiting Alibaba Cloud Hangzhou headquarters](../../../assets/aliyun-hangzhou-2026-06-16-1.webp)

This visit made me more willing to believe that AI should not remain only as a concept or a tool held by a small group. I hope it can enter real industries, land, and ordinary lives only after permission, responsibility, and real-world verification are in place.

![Learning about the Qwen large language model](../../../assets/aliyun-hangzhou-2026-06-16-2.jpg)

Going forward, I hope to keep exploring practical ways for AI to empower agriculture, forestry, animal husbandry, fisheries, and other parts of the real economy. In particular, I plan to provide free AI training for rural cooperatives, so that more ordinary people can understand AI, use AI, improve production efficiency, and discover new ways to grow their businesses.

Seeking benefits for ordinary people and doing practical work should not be only a slogan. After going through the lowest points of my life, I increasingly believe that turning the ability to stand up again into something useful for others is one of the most grounded reasons to keep moving forward.

## Closing: Starting Again Is Not a Triumph

I do not want to write 2026 as a victory over 2022. A visit, a title, and a direction begun again cannot repay the costs of the past or prove that the future has arrived. They show only that I can sit at the table again, face a problem, and let reality answer it.

Starting again is not becoming the person who believed he could solve everything. It is living with another kind of memory: companies can collapse, the body keeps accounts, choices can injure relationships, and a family's silence is not erased by later success. Knowing this, I still want to work, but no longer want to wager everyone's tomorrow on my own certainty.

There is no triumph or complete reconciliation at the end of this story. I am still learning how to carry responsibility, make repairs, and keep new work from repeating old harm. Perhaps beginning again means only seeing the cost earlier, asking for help sooner, and leaving a way back for myself and others when stopping becomes necessary.
