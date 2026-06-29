export interface HeroGuideSection {
  title: string;
  points: string[];
}

export interface HeroUltimateGuide {
  name: string;
  plan: string;
  goodAgainst: string[];
  avoidInto: string[];
}

export interface HeroGuide {
  heroId: string;
  heroName: string;
  category: 'hero' | 'fundamentals';
  role: 'Vanguard' | 'Duelist' | 'Strategist' | 'Fundamentals';
  image: string;
  sourceLabel: string;
  sourceUrl?: string;
  summary: string;
  poolJob: string;
  pickWhen: string;
  sections: HeroGuideSection[];
  ultimates: HeroUltimateGuide[];
}

export const HERO_GUIDES: HeroGuide[] = [
  {
    heroId: 'coach-mills-ultimate-beginners-guide',
    heroName: 'The Ultimate Beginner Guide',
    category: 'fundamentals',
    role: 'Fundamentals',
    image: '/images/heroes/captain-america.png',
    sourceLabel: "Coach Mills - Marvel Rivals Ultimate Beginner's Guide",
    sourceUrl: 'https://www.youtube.com/watch?v=nyEnGfGdFtU',
    summary:
      'A first-match foundation for Marvel Rivals: learn what each hero brings, play the objective through winning fights, and develop a small flexible hero pool.',
    poolJob:
      'Build reliable fundamentals before chasing advanced mechanics: manage cooldowns, understand your role, fight with your team, and reset when the fight is lost.',
    pickWhen:
      'Start here if you are new to Marvel Rivals or hero shooters and want a practical overview before choosing a main or entering competitive play.',
    sections: [
      {
        title: 'A hero shooter is more than aim',
        points: [
          'Every hero has a distinct primary fire, set of abilities, and rhythm. Give yourself permission to experiment before deciding what fits.',
          'Matches are won through ability timing, teamwork, positioning, and cooldown management as much as raw aim.',
          'A cooldown is valuable when it creates a meaningful swing: damage that wins an opening, healing that saves a teammate, protection that denies an enemy play, or utility that changes the fight.',
          'Do not spend major abilities just because they are available. Ask what the ability can accomplish before you commit it.',
          'Passives shape a hero automatically; active abilities are the decisions you can deliberately improve through repetition.',
          'Ultimates charge through contribution and time, then can dramatically change a fight. Use them for a clear fight-winning purpose instead of holding them forever or throwing them away alone.',
        ],
      },
      {
        title: 'Understand the three role jobs',
        points: [
          'Strategists support the team with healing, utility, damage, and high-impact decisions. Healing matters, but they are not limited to being healbots.',
          'Vanguards survive pressure, contest valuable ground, and let teammates take safer angles. Their job is to create space the team can actually use.',
          'Duelists convert openings into pressure and eliminations. They can threaten isolated targets, backlines, and enemies caught out of position.',
          'Think of a Vanguard as the team’s durable front and a Duelist as its finishing pressure, while Strategists keep the fight workable and create options.',
          'Your role is a starting responsibility, not a script. Watch the current fight and help solve the problem your team actually has.',
        ],
      },
      {
        title: 'Learn heroes, synergies, and matchups',
        points: [
          'Some hero combinations create team-up benefits, but a hero does not need a synergy to be useful.',
          'Matchups are about tools: which abilities let one hero pressure, escape, deny, or punish another hero.',
          'You do not need to master the entire roster immediately. Playing unfamiliar heroes briefly still teaches you what their cooldowns look like from the other side.',
          'Composition matters, but flexibility matters more than forcing a rigid formula. Adapt to the map, your teammates, and the threats the enemy is actually using.',
          'When an enemy is repeatedly causing trouble, identify the tool enabling them and look for a hero, angle, or teammate response that limits it.',
        ],
      },
      {
        title: 'Choose a main without trapping yourself',
        points: [
          'Try heroes that look interesting, even if they do not immediately seem like your style. You learn fit by playing, not by guessing from a roster screen.',
          'Build comfort on roughly three or four heroes with different answers to common situations rather than spreading practice across the whole roster.',
          'Keep enough flexibility to handle bans, difficult matchups, and team needs, especially as you move into more competitive games.',
          'Do not let a tier list choose your main. Strength at the highest level can differ from what works for your experience, platform, and current skill.',
          'A hero you enjoy and understand gives you better practice than a supposedly optimal pick you do not know how to play.',
        ],
      },
      {
        title: 'Play modes through their important moments',
        points: [
          'In Convoy, checkpoint progress changes future spawns and is worth committing resources to. Force defenders away from the objective, then convert the win into movement.',
          'In Domination, the objective matters, but winning the full team fight creates the safest capture time. Do not trade a winnable fight for a few isolated seconds on point.',
          'Health packs, alternative routes, high ground, and destructible cover all change which positions are safe and which escapes are available.',
          'Learn maps with a simple question: where can I recover, rotate, or take a better angle before the next fight starts?',
          'Use the environment intentionally. A route or piece of cover is valuable when it lets your team apply pressure without giving the enemy an easy target.',
        ],
      },
      {
        title: 'Win fights before chasing progress',
        points: [
          'A team fight is the committed clash where both teams spend abilities and ultimates. Winning it usually creates more objective progress than trickling onto the objective alone.',
          'Stay close enough to support teammates and help focus the same problem. Six separate duels rarely beat coordinated pressure.',
          'If a fight is clearly lost, disengage and regroup. Feeding staggered eliminations gives the enemy more time and resources.',
          'After a win, take the secure progress available: capture, push, establish better positions, and prepare for the enemy return.',
          'Track resources across the fight. Cooldowns and ultimates are shared opportunities; a team that uses them with a plan has a major advantage.',
        ],
      },
      {
        title: 'Improve one repeatable habit at a time',
        points: [
          'Use early matches to learn, not to judge yourself. Pick one simple focus such as saving an escape cooldown, finding health packs, or grouping before every fight.',
          'Quick Play is a useful place to test heroes and limits. Competitive play asks for more awareness, flexibility, and resource discipline.',
          'Review a frustrating death with one question: what information, position, cooldown, or timing decision would have made it safer?',
          'Good progress comes from small repeated improvements. You do not need every mechanic at once to become a reliable teammate.',
          'Keep the game enjoyable. Curiosity and consistent practice are more useful long-term than forcing yourself into a hero or style you dislike.',
        ],
      },
    ],
    ultimates: [],
  },
  {
    heroId: 'deadpool',
    heroName: 'Deadpool',
    category: 'hero',
    role: 'Vanguard',
    image: '/images/heroes/deadpool-vanguard.png',
    sourceLabel: "Fifth's Tankpool video guide",
    sourceUrl: 'https://www.youtube.com/watch?v=JJoZw60nFto&t=317s',
    summary:
      'Tankpool is not a sit-main damage sponge. He wins through pressure, disruption, pacing, stance swaps, upgrade discipline, shield timing, and controlled aggression.',
    poolJob:
      'Force attention, make the enemy team uncomfortable, build style points, and cycle in and out of pressure without exploding.',
    pickWhen:
      'Use Tankpool when your team benefits from chaos control: forcing cooldowns early, pressing supports, taking aggressive space, or stalling long enough to become impossible to ignore.',
    sections: [
      {
        title: 'Actual role: control chaos',
        points: [
          'Do not play Tankpool as a basic tank who sits main, hard-frontlines, soaks damage all game, and tries to stat-check everyone.',
          'His real value is pressure, disruption, pacing, and controlled aggression.',
          'Your job is to constantly force attention onto yourself while making the enemy team uncomfortable.',
          'Sometimes that means taking aggressive space and forcing people backward.',
          'Sometimes that means pressing supports so your DPS can move forward more easily.',
          'Sometimes that means forcing enemy cooldowns before the real fight even starts.',
          'Sometimes your value is simply surviving long enough that the enemy cannot ignore you.',
          'Every resource enemies spend dealing with you makes the fight easier for the rest of your team.',
          'Tankpool works best when he flows in and out of pressure instead of standing still.',
          'Keep repositioning, rotating angles, swapping stances, creating pressure, backing up, and re-engaging once resources return.',
          'Hard-forcing every engage without thinking will get you instantly deleted, especially after nerfs.',
          'If you cycle pressure properly, force attention, and survive through chaos, Tankpool becomes extremely disruptive.',
        ],
      },
      {
        title: 'Style points and upgrade discipline',
        points: [
          'Style points are the foundation of Tankpool upgrades.',
          'Your upgrades are what let Tankpool become oppressive during fights.',
          'If you hard-engage before farming style points, you are fighting at half strength.',
          'Many Tankpool players feel useless because they force pressure before building momentum.',
          'Build upgrades naturally before committing heavy pressure: poke people, pressure corners, force resources, and survive long enough to stack upgrades.',
          'Once upgraded, Tankpool becomes much harder to shut down: sustain is stronger, pressure is harder to ignore, cooldowns matter more, and enemies must respect your space.',
          'Fully upgraded Tankpool is a very different threat from zero-upgrade Tankpool.',
          'Take pictures whenever you get a kill.',
          'Close-range pictures give more style points; ranged pictures give fewer points, but both are useful.',
          'Taking a picture also provides an invincibility frame, so there is no reason to skip it after a kill.',
          'The guide recommends Ban Hammer first because it adds damage even when enemies are not missing.',
          'The E upgrade gives more attack speed with guns or swords, makes allies take less damage, and taunts enemies.',
          'The dash upgrade is valuable because it lets you dash twice instead of once.',
          'Gun upgrades are excellent because they add more damage.',
          'Upgrade priority can alternate depending on the enemy composition.',
        ],
      },
      {
        title: 'Master the whole kit: pistols and swords',
        points: [
          'Tankpool has pistols and swords, and each stance has its own cooldowns.',
          'Swap naturally between pistols and swords to get consistent value instead of playing only one stance.',
          'Use pistols at long range.',
          'When enemies enter your close effective range, swap to swords to punish that gap.',
          'Swords are strong for taking space and getting picks on targets who move too frequently to aim at cleanly.',
          'Swords are especially useful for pressuring supports in the backline because a bouncing Tankpool is hard to hit.',
          'Swords also make people back away, which is space control.',
          'When supports retreat from your dash pressure, your team gains natural space and your duelists can get more value.',
          'Mobility is not only for engaging. Every mobility tool should help you get in and get out.',
          'If you feel stuck, are taking too much damage, or expect to die, use dash to disengage.',
          'You can combine dash with other parts of the kit to escape bad situations.',
        ],
      },
      {
        title: 'Dash range and sword combo',
        points: [
          'The dash radius shown in the guide is about 10 meters.',
          'The ideal sword combo is dash, jump, then slash.',
          'The jump matters because no-jump versions are slower and less fluid.',
          'Practice the combo slowly first: dash, jump, slash.',
          'Then practice the faster version until it becomes natural.',
          'Practice the combo without E and with E so you understand both unupgraded and attack-speed-increased timing.',
          'Sword attacks can crit, so aim for the head during the combo when possible.',
          'With the attack-speed increase, the sword sequence becomes much faster and can secure kills more reliably.',
          'A frequent pattern is to use the gun ultimate on a support, then use swords to finish the kill more easily.',
        ],
      },
      {
        title: 'Ban Hammer discipline',
        points: [
          'Ban Hammer is the guide author’s favorite part of Tankpool’s kit, but many players misuse it because they do not understand the mechanics.',
          'Unupgraded Ban Hammer gives a large burst of survivability when dropped on a target.',
          'It gives instant bonus health and steady healing over time.',
          'It also taunts the target with an icon.',
          'If the taunted target shoots and misses, they instantly take damage and Tankpool gains even more bonus health.',
          'This punishes enemies for panicking.',
          'When upgraded, Ban Hammer becomes much more lethal.',
          'The upgraded version adds heavy damage over time on top of the base effects.',
          'The target takes damage every second even if they do not shoot and do not miss.',
          'If they start missing while upgraded Ban Hammer is active, the damage becomes even worse.',
          'The guide heavily favors dropping upgraded Ban Hammer on Strategists because they are the enemy team’s lifeline.',
          'When you lock upgraded Ban Hammer onto an enemy support, they are put in a lose-lose situation: they take constant damage, and if they try to heal teammates while missing, they take more.',
          'This melts supports and disrupts their rhythm.',
        ],
      },
      {
        title: 'Sword ultimate usage',
        points: [
          'The guide says the sword ultimate is not used as often by the author.',
          'When you do swap to the katana ultimate, its biggest value is survival.',
          'It gives a movement boost and chunks of healing over time.',
          'Treat it as a defensive tool to buy time, stall point, or stay alive under heavy focus fire.',
          'The goal is to survive long enough for your team to swing momentum back.',
        ],
      },
      {
        title: 'Plushie Shield discipline',
        points: [
          'The guide emphasizes this is Plushie Shield, not Doctor Strange shield.',
          'Base Plushie Shield has 300 health.',
          'Upgraded Plushie Shield reaches 400 health and gains a little more radius.',
          'The tool is niche, but its utility is very strong when used correctly.',
          'Save it to deny massive enemy ultimates.',
          'Drop it to cut off an enemy support’s line of sight so they cannot heal their tank.',
          'Use it to block damage for a split second so you can reset and get healed.',
          'You can also use it to take space.',
          'If Doctor Strange is outside the shield, or you are outside relative to him, it can block the interaction; if he walks inside, the situation changes.',
          'Enemies and supports cannot heal through it, so you can trap a support and isolate a kill.',
          'A Duelist can shred through the shield in about two seconds, so do not treat it as permanent cover.',
          'Use it strategically: it can temporarily block damage, but it will fall.',
        ],
      },
      {
        title: 'Passive: Healing Factor',
        points: [
          'Healing Factor triggers when you take massive burst damage or get hit by a lethal one-shot ability.',
          'It gives a brief window of invincibility and rapid healing to keep you alive.',
          'It effectively acts like a second life.',
          'It has a strict 45-second cooldown.',
          'You cannot fully control when it triggers, so play your life carefully and try not to pop it too early.',
        ],
      },
      {
        title: 'Tank discipline in full fights',
        points: [
          'Tankpool discipline is about knowing your limits, playing your life, and putting your team in a position to win.',
          'The guide’s example focuses on surviving and stalling the objective against the odds.',
          'Even when the ending gets messy, surviving long enough can be the reason your team still has a chance to win.',
          'Your job is not always to get the clean finish yourself. Sometimes your job is to keep the fight alive until your team can recover momentum.',
        ],
      },
    ],
    ultimates: [
      {
        name: 'The Ban Hammer / Gun Ultimate',
        plan:
          'Prioritize Strategists because they are the enemy team’s lifeline. Upgraded Ban Hammer creates constant damage, punishes missed shots or missed healing attempts, and breaks support rhythm.',
        goodAgainst: [
          'Enemy Strategists',
          'The Punisher ultimate',
          'Moon Knight ultimate if it misses targets',
          'Squirrel Girl',
          'Hitscan heroes',
          'Ultron ultimate',
          'Jeff while he is actively healing',
        ],
        avoidInto: [
          'Jeff if he goes underground and stops healing',
          'Targets who can completely disengage before the pressure matters',
          'Low-value DPS targets when an enemy support is available',
        ],
      },
      {
        name: 'Katana / Sword Ultimate',
        plan:
          'Use it mainly as a survival ultimate: movement speed plus healing over time lets you buy time, stall point, or live through heavy focus fire.',
        goodAgainst: [
          'Heavy focus fire',
          'Objective stall situations',
          'Moments where your team needs time to re-enter',
          'Chaotic fights where staying alive creates more value than chasing damage',
        ],
        avoidInto: [
          'Clean disengage situations where you can save the ultimate',
          'Fights already lost with no team follow-up',
          'Using it only for damage when survival is the real value',
        ],
      },
      {
        name: 'Magical Unicorn Shield / Plushie Shield',
        plan:
          'Use it as a short, tactical denial tool: block an ultimate, cut healing line of sight, isolate a support, or buy a brief reset window.',
        goodAgainst: [
          'Magneto ultimate',
          'Support healing lines',
          'Isolating a support inside or outside the shield',
          'Brief damage blocks while resetting',
          'Taking space through a dangerous angle',
        ],
        avoidInto: [
          'Phoenix ultimate because it cuts through',
          'Duelists who can shred the 300-400 health shield quickly',
          'Treating it like permanent cover',
          'Dropping it without a specific line-of-sight or ultimate-denial purpose',
        ],
      },
    ],
  },
  {
    heroId: 'neutral-game-fundamentals',
    heroName: 'Neutral Game Fundamentals',
    category: 'fundamentals',
    role: 'Fundamentals',
    image: '/images/heroes/doctor-strange.png',
    sourceLabel: 'N / Nen - Neutral Game transcript',
    summary:
      'Neutral is the state before either side has a clear advantage: both teams are controlling space, baiting resources, and waiting for the mistake that opens the fight.',
    poolJob:
      'Use movement, spacing, cooldown tracking, and pressure to create a small advantage before the big engage, pick, or ultimate chain begins.',
    pickWhen:
      'Use this guide when people talk about neutral and you are not sure what it means, or when every fight feels like nothing matters until ultimates start flying.',
    sections: [
      {
        title: 'Neutral is before the big moment',
        points: [
          'Neutral is everything that happens before and between the obvious fight-swinging moments.',
          'In a fighting game, the flashy parts are combos, powered-up states, and super moves. Neutral is the movement, spacing, jabs, baiting, and waiting that happens before those moments land.',
          'In Marvel Rivals, the flashy parts are big engages, eliminations, and ultimates. Neutral is the quieter phase where both teams are trying to earn the right to make one of those plays.',
          'A neutral state means neither team has a clear advantage yet. Both sides are looking for space, information, cooldowns, damage, and a mistake to punish.',
          'Neutral is not doing nothing. It is the part of the game where players are testing each other without fully committing.',
        ],
      },
      {
        title: 'The fighting game comparison',
        points: [
          'The transcript uses Tekken as the clean example because fighting games make neutral easier to see.',
          'Players may look like they are only stepping forward, backing away, poking, or waiting, but they are actually controlling space and baiting unsafe actions.',
          'The goal is to make the opponent press the wrong button, move into the wrong range, or spend a powerful option at the wrong time.',
          'Once that mistake happens, the player can cash out with the big combo, powered-up move, or super.',
          'The same principle applies in team games: the big play usually comes after a smaller neutral mistake creates permission to commit.',
        ],
      },
      {
        title: 'Neutral in Marvel Rivals',
        points: [
          'In Marvel Rivals, neutral is about cooldowns, space control, positioning, baiting, and waiting for the enemy team to push too hard or too little.',
          'Both teams are trying to control the playable area of the map without being punished.',
          'Both teams are tracking resources: their own cooldowns, enemy cooldowns, ultimates, defensive saves, mobility, and healing tools.',
          'A good neutral exchange can be as simple as forcing an enemy to waste a cooldown while your team keeps its resources intact.',
          'A bad neutral exchange is giving the enemy the first opening by walking into danger, spending an important tool for no value, or overextending before your team is ready.',
        ],
      },
      {
        title: 'Why ultimates make neutral feel muddy',
        points: [
          'The transcript argues that Marvel Rivals does have neutral, but frequent ultimates can make neutral feel less important than it should.',
          'When ultimates happen constantly, matches can feel like both teams are mostly racing to build the next fight-winning button.',
          'Strategist ultimates can erase danger or create huge sustain windows, while Duelist ultimates can delete players quickly.',
          'Because those ultimates counteract and chain into each other, the quieter skill expression before the ultimate phase can feel compressed.',
          'That does not mean neutral is fake. It means you have to recognize the neutral phase before the ultimate lines start stacking.',
        ],
      },
      {
        title: 'What you are looking for',
        points: [
          'Look for enemy cooldowns spent too early. A movement tool, shield, stun, defensive save, or healing burst can become the signal that your team can press.',
          'Look for enemies who push too far. Overextension is one of the clearest neutral mistakes because it gives your team a target before the enemy is ready to trade back.',
          'Look for enemies who push too little. If the enemy refuses to contest space, your team can move forward, take angles, and start the next fight from a stronger position.',
          'Look for your own openings too. If your team has better cooldowns, stronger angles, or healthier players, neutral has already started tilting in your favor.',
          'The point is to notice the moment of weakness before everyone commits at once.',
        ],
      },
      {
        title: 'How each role plays neutral',
        points: [
          'Vanguards play neutral by testing space, threatening forward movement, protecting key lanes, and watching for the enemy to spend tools that make a push safer.',
          'Duelists play neutral by pressuring angles, poking, threatening backlines, and making the enemy respect their position before committing to a kill.',
          'Strategists play neutral by keeping the team stable, preserving major saves, holding safe sightlines, and using utility to deny the enemy opening.',
          'No role should treat neutral as permission to stand still. Everyone is either controlling space, denying space, baiting resources, or preparing for the punish.',
          'The best neutral plays often look small until the fight starts and the enemy is missing the cooldown, position, or health they needed.',
        ],
      },
      {
        title: 'Neutral checklist',
        points: [
          'Ask whether either team has a clear advantage yet. If not, you are probably in neutral.',
          'Ask what space your team is trying to control and what space the enemy is trying to protect.',
          'Ask which cooldowns matter most before the fight can safely begin.',
          'Ask whether the enemy just made a mistake by pushing too hard, backing up too far, or spending a resource too early.',
          'Ask whether your next action creates pressure without opening your team to an easy punish.',
        ],
      },
    ],
    ultimates: [],
  },
  {
    heroId: 'survival-discipline',
    heroName: 'Survival Discipline',
    category: 'fundamentals',
    role: 'Fundamentals',
    image: '/images/heroes/black-cat.png',
    sourceLabel: 'Original survival discipline video',
    sourceUrl: 'https://www.youtube.com/watch?v=QzdA27zMupI&list=PL5TQ7tktRWOC3sAGM2Fg-TdOQTDSxMHd6',
    summary:
      'Survival discipline is the skill of staying alive long enough to keep pressure, information, angles, and fight influence active.',
    poolJob:
      'Maintain pressure without throwing your life away for ego chases, low-health targets, or trades that remove your influence from the fight.',
    pickWhen:
      'Use this guide when you are dying after forcing plays, chasing low targets too far, or trading your life even though your pressure was more valuable than the kill.',
    sections: [
      {
        title: 'The overlooked skill: play your life',
        points: [
          'One of the biggest mistakes players make at every rank is not knowing how to play their life.',
          'Many players think value only comes from kills.',
          'They see someone low, force the chase, secure the elimination, and immediately die for it.',
          'In their head, the trade feels worth it, but a lot of the time it is not.',
          'This is especially true if you are the player creating pressure, controlling angles, and forcing resources.',
          'Survival is not passive. It is one of the most overlooked skills in the game.',
        ],
      },
      {
        title: 'What a trade actually costs',
        points: [
          'If you are dictating the pace of the lobby, trading your life for a support or DPS can be a net loss for your team.',
          'The moment you die, your active pressure disappears.',
          'Your angle disappears.',
          'Your target priority disappears.',
          'Your ability to influence the fight disappears.',
          'The enemy team gets to breathe again because they no longer have to account for you.',
          'Higher-elo players do not only ask, "Can I get this kill?" They ask, "Is this kill worth dying for?"',
          'Sometimes the strongest play is not securing the elimination.',
          'Sometimes the strongest play is forcing three people to turn around, forcing cooldowns, forcing resources, and walking away alive.',
        ],
      },
      {
        title: 'Pressure without the kill',
        points: [
          'The guide uses Black Cat as the example: when flanking, the goal is not always to kill someone.',
          'Sometimes the goal is simply to make the enemy support look at you instead of healing their tank.',
          'Sometimes the goal is to force defensive cooldowns.',
          'Sometimes the goal is to create attention and then leave.',
          'You do not always need the kill immediately.',
          'You do not always need the flashy play.',
          'If the enemy team has no resources left and your team walks forward for free, you created real value.',
          'Your presence creates a worry factor: enemies have to think about where you are and whether someone is in their backline.',
          'That kind of value often does not show on the scoreboard.',
        ],
      },
      {
        title: 'Alive pressure changes enemy behavior',
        points: [
          'If you are holding an angle, the enemy has to respect it.',
          'If you are threatening a flank, the enemy has to respect it.',
          'If you are alive, the enemy has to account for you.',
          'When you are dead, they do not.',
          'Good players will burn cooldowns, disengage, grab health packs, wait for resources, reset, and then re-enter the fight.',
          'Cooldowns are often shorter than death timers.',
          'Surviving also has a mental effect: when you refuse to die, enemies get impatient.',
          'They overcommit, tunnel vision, and chase plays that are not really there because you have been annoying them for minutes.',
          'That impatience is often where the fight falls apart for them.',
        ],
      },
      {
        title: 'Let low-health targets go',
        points: [
          'One of the hardest things to learn is letting opportunities go.',
          'Let the 10 HP target escape when chasing them would ruin your position or cost your life.',
          'Let the fight breathe instead of forcing the heroic play.',
          'The guide uses Star-Lord as the example: chasing a low target into a room where you lose your spacing advantage is usually an ego play.',
          'You do not need that kill if the target is already out of the fight.',
          'A low enemy searching for healing or a health pack is no longer impacting the team fight.',
          'Move on to the next target and keep applying pressure.',
        ],
      },
      {
        title: 'Most deaths are commitment problems',
        points: [
          'Most deaths do not happen because players lack mechanics.',
          'They happen because players convince themselves they need one more shot.',
          'Or one more dash.',
          'Or one more second.',
          'Or one more chase.',
          'Then they end up staring at the respawn screen.',
          'Every time that happens, they lose more value than they realize.',
        ],
      },
      {
        title: 'Staying alive collects information',
        points: [
          'Every second you are alive, you collect information.',
          'You see rotations.',
          'You see cooldowns.',
          'You see who wants to take an angle.',
          'You see who wants to play safe.',
          'You create pressure simply by existing on the map.',
          'The longer you are alive, the more chances you have to impact the game.',
          'One good angle can win a fight.',
          'One good target swap can win a fight.',
          'One good cooldown force at the right time can win a fight.',
          'None of that can happen from the spawn room.',
        ],
      },
      {
        title: 'Survival is active, not passive',
        points: [
          'Surviving does not mean hiding.',
          'It does not mean refusing to take risks.',
          'It means understanding the difference between a good opportunity and a bad commitment.',
          'It means knowing when to push, when to pressure, when to disengage, and when to let a play go and fully reset.',
          'The best players are not forcing something every five seconds.',
          'They constantly give themselves another opportunity to make an impact.',
          'Those opportunities stack up: another angle, another cooldown forced, another support pressured, another fight won.',
        ],
      },
      {
        title: 'Measure pressure, not only kills',
        points: [
          'The main takeaway is to stop measuring value only by the kills you secure.',
          'Start measuring value by the pressure you maintain.',
          'Some of the most impactful players in a lobby are not the ones forcing the most fights.',
          'They are the players surviving long enough to influence every fight.',
          'That is survival discipline.',
        ],
      },
    ],
    ultimates: [],
  },
  {
    heroId: 'engagement-discipline',
    heroName: 'Engagement Discipline',
    category: 'fundamentals',
    role: 'Fundamentals',
    image: '/images/heroes/star-lord.png',
    sourceLabel: 'Stop Forcing Fights video guide',
    sourceUrl: 'https://www.youtube.com/watch?v=FwU4jGEaUIQ&list=PL5TQ7tktRWOC3sAGM2Fg-TdOQTDSxMHd6&index=2',
    summary:
      'Engagement discipline is the skill of knowing when a fight is actually ready to be played instead of forcing damage, peeks, dives, or ego pressure before your team has a real window.',
    poolJob:
      'Use the setup phase to get healthy, find your angle, read resources, and wait for the opening that turns positioning into real pressure.',
    pickWhen:
      'Use this guide when you die before fights start, poke from open space, chase damage numbers, or dive before your frontline and teammates have created a safe timing window.',
    sections: [
      {
        title: 'Early deaths are usually pacing errors',
        points: [
          'The guide opens with a common Marvel Rivals problem: spawn doors open, players walk out, and someone dies within the first 10 seconds before the fight even really starts.',
          'Those deaths usually are not caused by a coordinated ultimate or a five-player collapse.',
          'They often happen because someone walked somewhere they had no business being and then explained it as looking, poking, or getting hit by a lucky shot.',
          'As players climb, those excuses matter less because early deaths are usually bad pacing, not bad luck.',
          'The major difference between many lower-elo and higher-elo players is not just mechanics. It is engagement discipline.',
          'Engagement discipline means understanding when a fight is actually ready to be played.',
          'A lot of players see an enemy and immediately feel obligated to shoot, peek, push, dive, or force value.',
          'Sometimes the best play is to do nothing yet because the fight has not reached the timing where your action will actually matter.',
        ],
      },
      {
        title: 'Do not treat setup like the fight',
        points: [
          'The biggest mistake in the guide is treating the setup phase like the actual fight.',
          'Players leave spawn, walk straight down main, shoot the first visible target, and hope something happens.',
          'That is not pressure. That is exposure.',
          'Every pointless peek gives the enemy a free opportunity to punish you.',
          'Even if you survive, you may force your Strategists to heal unnecessary damage or force your Vanguard to spend protection resources early.',
          'That damages your team economy and tempo because teammates must clean up a mistake that did not need to happen.',
          'Many players think they are helping because they see damage numbers.',
          'Damage numbers do not automatically equal value.',
          'Standing in the open shooting a tank who is being healed through everything usually does not accomplish much.',
          'In that situation, you are mostly making yourself easier to punish.',
        ],
      },
      {
        title: 'Split every fight into setup and execution',
        points: [
          'The guide recommends separating every fight into two parts: setup and execution.',
          'During setup, your goal is not to farm damage.',
          'Your setup goals are to get ready, find your angle, identify targets, see where teammates are positioned, and understand what resources both teams have available.',
          'The most important setup rule is to keep your health bar full.',
          'When the actual fight starts, you want to enter it at your strongest instead of already damaged, down cooldowns, or out of position.',
          'Higher-elo players are patient in this phase.',
          'They sit behind cover, hold off-angles, wait for information, wait for cooldowns to be burned, and wait for someone to create an opening.',
          'Just because you can shoot does not mean you should.',
          'Just because you can dive in and brawl does not mean you should.',
          'Waiting five seconds can create a better opportunity than forcing something immediately.',
        ],
      },
      {
        title: 'Cover is your default position',
        points: [
          'The first practical fix is to get comfortable using cover.',
          'Cover should not be something you run to only after you are already losing the trade.',
          'Cover should be your default starting position.',
          'When you take an angle, know where you will retreat if the trade goes wrong.',
          'Know where the nearest health pack is.',
          'Know where your nearest Strategist is.',
          'The goal is not to force a fight every time you see somebody.',
          'The goal is to create pressure while still having an escape available.',
          'Good pressure is repeatable because you can survive, reset, and pressure again.',
          'Bad pressure leaves you exposed and forces your team to spend resources fixing your positioning.',
        ],
      },
      {
        title: 'Ask who can actually die',
        points: [
          'The guide says to stop asking, "Who can I shoot?" and start asking, "Who can I actually kill?"',
          'Those are completely different questions.',
          'Seeing a target does not mean the target is vulnerable.',
          'Before committing, check whether the target still has cooldowns.',
          'Check whether they are being healed.',
          'Check whether they are playing behind cover.',
          'Check whether they can simply walk away.',
          'If any of those answers are yes, it is often better to wait.',
          'Engagement discipline is the discipline of waiting for the correct window.',
          'A window might be an enemy overextending, a support using an important cooldown, a tank turning the wrong way, or someone walking too far from their team.',
          'Players who climb consistently tend to recognize those windows quickly.',
          'They are not randomly forcing opportunities. They are identifying and enforcing real ones.',
        ],
      },
      {
        title: 'Let the frontline open the fight',
        points: [
          'The guide specifically calls out Duelist impatience: it is hard to wait, but squishy characters especially need that patience.',
          'You do not need to be the first person seen every fight.',
          'Let your Vanguard take space first.',
          'Let the frontline draw attention.',
          'Let them soak damage and force enemy resources.',
          'When the enemy team starts looking somewhere else, that is your signal.',
          'That is when the fight actually opens.',
          'That is when positioning becomes pressure.',
          'That is when pressure turns into kills.',
          'That is when the execution phase begins and your damage can push the fight forward instead of exposing you early.',
        ],
      },
      {
        title: 'Execution starts after the window appears',
        points: [
          'The execution phase is where you finally commit your damage, dive, off-angle, or brawl timing.',
          'You execute after your team has space, enemies have spent resources, or a vulnerable target is actually killable.',
          'Your job is to convert the opening instead of trying to create every opening by yourself from a bad position.',
          'If the enemy is looking away, a support cooldown is gone, or a target is separated, your pressure has a much higher chance of becoming a final blow.',
          'If none of those conditions exist, forcing the fight early usually creates an unforced mistake.',
          'Many ranked games are decided by those unforced mistakes.',
          'Rushing your engagement is one of the biggest ones.',
          'Slow down, be patient, wait for your window, and stop forcing fights before they are ready to happen.',
        ],
      },
      {
        title: 'Quick discipline checklist',
        points: [
          'Before peeking, ask whether the fight is still in setup or has actually reached execution.',
          'Start from cover and keep a retreat route available.',
          'Enter the real fight with full health whenever possible.',
          'Track where your teammates are before committing.',
          'Look for cooldowns, overextensions, isolated targets, and enemies facing the wrong direction.',
          'Do not mistake safe-looking damage numbers for real value.',
          'Let your Vanguard or frontline pressure create attention before you expose yourself.',
          'When the window appears, execute decisively instead of hesitating.',
          'When the window is not there, wait, reposition, and preserve your resources.',
        ],
      },
    ],
    ultimates: [],
  },
  {
    heroId: 'season-8-5-discipline',
    heroName: 'Season 8.5 Discipline',
    category: 'fundamentals',
    role: 'Fundamentals',
    image: '/images/heroes/phoenix.png',
    sourceLabel: 'The Real Reason You Are Losing in Season 8.5 video guide',
    sourceUrl: 'https://www.youtube.com/watch?v=J2Y3Oqq7RYc&list=PL5TQ7tktRWOC3sAGM2Fg-TdOQTDSxMHd6',
    summary:
      'Season 8.5 rewards fundamentals harder: positioning, timing, resource management, sightline respect, and patience matter more than forcing fights or blaming the newest strong hero.',
    poolJob:
      'Use discipline to survive poke pressure, avoid macro mistakes, and enter fights with health, cooldowns, and positioning intact.',
    pickWhen:
      'Use this guide when poke comps feel impossible, Cyclops or long-range heroes punish every rotation, or your team loses fights before anyone even dies.',
    sections: [
      {
        title: 'Season 8.5 punishes macro mistakes',
        points: [
          'The guide argues that many players are looking at Season 8.5 the wrong way by focusing only on whether heroes like Cyclops or Black Cat are broken, S-tier, or weak.',
          'The bigger story is that discipline matters again.',
          'Positioning, timing, resource management, and understanding when to engage all matter more in this patch.',
          'Players who rely on forcing every fight are starting to feel punished.',
          'The patch punishes not only mechanical mistakes, but also macro mistakes.',
          'Examples include taking one extra peek, walking through one bad angle, chasing one kill too far, or using one cooldown too early.',
          'The players climbing are not always the players with the craziest mechanics.',
          'The players climbing are often the ones making the fewest mistakes.',
        ],
      },
      {
        title: 'Cyclops punishes bad habits',
        points: [
          'The guide says the most important thing about Cyclops is not simply his damage. It is what he punishes.',
          'Cyclops punishes players who stand in places they should not stand.',
          'He punishes wide peeks, open sightline rotations, and staying visible longer than necessary.',
          'Before this patch, players could sometimes get away with those habits.',
          'Against Cyclops, disrespecting an angle, rotating carelessly through open space, or staying visible too long usually means taking damage.',
          'The guide frames that as healthy because positioning should matter.',
          'Players with strong fundamentals do not struggle against him as much because they already respect danger.',
          'Players with sloppy positioning can feel like he is impossible because he is exposing problems they already had.',
        ],
      },
      {
        title: 'Position relative to danger',
        points: [
          'Positioning is not only where you are standing.',
          'Positioning is where you are standing relative to danger.',
          'Ask whether you can break line of sight from your current position.',
          'Ask whether you can retreat if the enemy looks at you.',
          'Ask whether you can reposition without crossing a lethal sightline.',
          'Ask whether you can survive if multiple enemies suddenly turn toward you.',
          'Those questions matter more than the raw location you are occupying.',
          'Cyclops forces players to answer those questions more honestly.',
        ],
      },
      {
        title: 'Adjust to the enemy composition',
        points: [
          'The guide warns that players often move the exact same way no matter what they are playing against.',
          'When Cyclops appears on the enemy team, your movement around the map should change.',
          'Ask where Cyclops is positioned and what angle he controls.',
          'Ask whether he can see your rotation.',
          'Ask how many enemies can actually shoot you if you step out.',
          'Higher-level players constantly adjust to the lobby instead of only playing their own character plan.',
          'If Phoenix controls an angle, they respect it.',
          'If Hela controls a sightline, they respect it.',
          'If Cyclops watches a rotation, they respect it.',
          'That respect is not fear. It is awareness.',
        ],
      },
      {
        title: 'Poke comps win with pressure',
        points: [
          'The biggest Season 8.5 story in the guide is how much poke is showing up.',
          'Phoenix, Hela, Cyclops, and certain support compositions make the game feel more pressure-oriented.',
          'A lot of players misunderstand poke because they think its value is only damage.',
          'The guide says poke is really about pressure.',
          'A good poke composition does not need to instantly kill you.',
          'It only needs to make every decision harder.',
          'Every angle, rotation, and mistake becomes dangerous.',
          'Those mistakes stack until your team loses health, supports burn cooldowns, tanks lose resources, and your team gets forced into awkward positions.',
          'That is why you can feel like you are losing before the fight has actually started.',
        ],
      },
      {
        title: 'Poke is happy winning slowly',
        points: [
          'Poke compositions do not need to win fights quickly.',
          'They are comfortable winning slowly by applying pressure until someone cracks.',
          'Dive compositions usually want a specific moment: an isolated target, a missing cooldown, or a clean jump target.',
          'Poke compositions can sit in neutral and keep applying pressure until a support uses a cooldown early, a tank spends resources before taking space, or a Duelist gets impatient.',
          'The longer neutral lasts, the more chances there are for small mistakes to happen.',
          'By the time the fight starts, a strong poke team may have already won half of it.',
          'This is why patience is so important against poke.',
          'Just because someone pressures you does not mean you have to respond immediately.',
        ],
      },
      {
        title: 'Do not fight poke on its terms',
        points: [
          'The first bad habit to break is fighting a poke composition on its own terms.',
          'Do not walk straight down main, take unnecessary damage, burn resources, force a bad fight, and then wonder why the enemy team feels impossible to beat.',
          'Respect sightlines first.',
          'Not every angle needs to be challenged immediately.',
          'Sometimes the correct play is rotating.',
          'Sometimes the correct play is waiting.',
          'Sometimes the correct play is doing nothing for five seconds.',
          'That may feel boring, but discipline often looks boring before it wins fights.',
        ],
      },
      {
        title: 'Health is a resource',
        points: [
          'The guide emphasizes that health is a resource.',
          'The fight starts long before the first eliminations happen.',
          'If you enter every fight at half health because you could not stop peeking, you are making the game much harder than necessary.',
          'Supports become more important in a poke-heavy meta because they keep fights stable.',
          'White Fox gains value because she can support off-angles and make poke heroes harder to isolate.',
          'Luna gains value because she can contribute meaningful ranged damage while keeping the team topped up.',
          'Supports who can sustain, apply pressure, and move well become extremely valuable.',
          'Tanks also feel the patch strongly because taking space is not as simple as walking forward anymore.',
        ],
      },
      {
        title: 'Stop forcing every window',
        points: [
          'The final lesson is to stop forcing.',
          'Not every target is your target.',
          'Not every window is your window.',
          'Not every fight is your fight.',
          'The best players are not constantly forcing action.',
          'They wait for the right opportunity, then capitalize instantly when it appears.',
          'Season 8.5 did not create poor positioning, poor timing, poor resource management, or poor engagement discipline.',
          'It is simply punishing those problems harder.',
          'Metas change, heroes rise and fall, but strong fundamentals survive every patch.',
        ],
      },
    ],
    ultimates: [],
  },
  {
    heroId: 'presence-pressure',
    heroName: 'Presence Pressure',
    category: 'fundamentals',
    role: 'Fundamentals',
    image: '/images/heroes/black-cat.png',
    sourceLabel: 'Most Overlooked Skill short guide',
    sourceUrl: 'https://www.youtube.com/watch?v=9RJ9VfZv8EY&list=PL5TQ7tktRWOC3sAGM2Fg-TdOQTDSxMHd6',
    summary:
      'Presence pressure is the value you create simply by staying alive on an angle or flank long enough that the enemy must respect you.',
    poolJob:
      'Stay alive, hold threatening space, force attention, reset when needed, and re-enter before the enemy can ignore your pressure.',
    pickWhen:
      'Use this quick guide when you measure value only by kills, die for low-value trades, or forget that staying alive can carry a fight by itself.',
    sections: [
      {
        title: 'Presence creates value',
        points: [
          'The short guide argues that value does not only come from kills.',
          'Your presence alone can create pressure.',
          'If you hold an angle, the enemy has to respect it.',
          'If you threaten a flank, the enemy has to respect it.',
          'If you are alive, the enemy has to account for you.',
          'The moment you die, they do not have to think about you anymore.',
          'This is why survival discipline matters so much.',
        ],
      },
      {
        title: 'Survive, reset, and re-enter',
        points: [
          'Good players will spend resources to survive instead of dying for a fragile play.',
          'They disengage when the fight turns bad.',
          'They reset instead of continuing a losing trade.',
          'They grab health packs when that is the fastest safe recovery path.',
          'They re-enter later with cooldowns and health restored.',
          'Cooldowns come back faster than dying and walking back from spawn.',
          'The art of staying alive is one of the ways you carry games without always needing the final blow.',
        ],
      },
      {
        title: 'Quick pressure checklist',
        points: [
          'Before committing, ask whether your presence is already forcing respect.',
          'Do not trade your life if simply staying alive keeps an angle closed.',
          'Use disengage tools before the enemy turns your pressure into a death.',
          'Reset through cover, a health pack, or your Strategists.',
          'Re-enter once cooldowns return and the enemy has to account for you again.',
        ],
      },
    ],
    ultimates: [],
  },
  {
    heroId: 'duelist-pressure-over-damage',
    heroName: 'Duelist Pressure Over Damage',
    category: 'fundamentals',
    role: 'Fundamentals',
    image: '/images/heroes/psylocke.png',
    sourceLabel: 'Stop Chasing Damage duelist guide',
    sourceUrl: 'https://www.youtube.com/watch?v=kPnMQTQuEpc&list=PL5TQ7tktRWOAakGzPXBwS7Vwjs9bSIYLt',
    summary:
      'A Duelist wins by creating pressure, splitting attention, forcing resources, and punishing mistakes, not by farming scoreboard damage into the tank.',
    poolJob:
      'Attack from useful angles, make supports and DPS react to you, then reset before your pressure turns into a death.',
    pickWhen:
      'Use this guide when you have high damage but low final hits, spend fights shooting tanks, or struggle to turn pressure into space and picks.',
    sections: [
      {
        title: 'Damage is not the whole job',
        points: [
          'The guide argues that Duelists are not valuable only because they deal damage.',
          'A Duelist should apply pressure past the tank and disrupt the flow of the fight.',
          'High damage numbers can still lose games if they do not control space, force attention, or create picks.',
          'Pressure means forcing the enemy team to deal with you.',
          'When pressure is real, supports turn around, tanks lose space, DPS lose off-angles, and the fight starts to fracture.',
          'Sometimes the value is not a kill. Sometimes it is forcing ultimates, cooldowns, healing resources, or attention away from your team.',
        ],
      },
      {
        title: 'Why damage stats lie',
        points: [
          'Shooting the tank all game can create impressive damage stats while changing very little about the fight.',
          'Predictable damage into a healed tank is often easy for the enemy to absorb.',
          'There is a time to shoot tanks, but if nobody is moving and the fight is stuck on main, you usually need to disrupt somewhere else.',
          'Pressure from an off-angle forces movement because enemies feel threatened from more than one direction.',
          'When enemies move, backpedal, or turn around, they are more likely to make mistakes your team can punish.',
          'Final blows and fight wins come from making the enemy uncomfortable, not from damage padding.',
        ],
      },
      {
        title: 'Off-angles create the pressure',
        points: [
          'The easiest Duelist pressure often comes from side angles, high ground, or the enemy backline.',
          'Instead of stacking with your whole team, attack from a different direction so the enemy has two problems at once.',
          'If they ignore you, you may get free kills.',
          'If they turn toward you, your team gets attention value and more room to play.',
          'Off-angles work because most players cannot track every direction during a main fight.',
          'The timing still matters: if someone is already contesting you, reset instead of building habits around lucky escapes.',
        ],
      },
      {
        title: 'Pressure needs life discipline',
        points: [
          'When taking disruptive angles, you must still play your life.',
          'Know where health packs are before you enter.',
          'Have an escape plan every time you pressure an angle.',
          'If a defender contests you or the situation stops being favorable, reset and re-enter later.',
          'Good Duelists wait for chaos before committing because divided enemy attention makes pressure safer and more lethal.',
          'Sometimes you only test an angle, force a reaction, and leave.',
          'Sometimes the enemy team is scattered enough that you can hard commit.',
        ],
      },
      {
        title: 'Main pressure still counts',
        points: [
          'The lesson is not that every Duelist must flank every fight.',
          'Some Duelists can play main well and create pressure with their team.',
          'Even from main, the job is not mindless tank farming.',
          'The job is finding the right targets, disrupting the frontline, punishing exposed squishies, and helping space move forward.',
          'Whether you flank, off-angle, play near your tank, or push main, the goal stays the same: create pressure, force attention, and punish mistakes.',
        ],
      },
    ],
    ultimates: [],
  },
  {
    heroId: 'duelist-disengage-discipline',
    heroName: 'Duelist Disengage Discipline',
    category: 'fundamentals',
    role: 'Fundamentals',
    image: '/images/heroes/black-cat.png',
    sourceLabel: 'Stop Forcing Fights duelist guide',
    sourceUrl: 'https://www.youtube.com/watch?v=GY37xZLPkC8&list=PL5TQ7tktRWOAakGzPXBwS7Vwjs9bSIYLt',
    summary:
      'Disengage discipline is knowing when a Duelist fight has stopped being favorable and resetting before a good play turns into a death.',
    poolJob:
      'Evaluate fights in real time, leave before pressure overwhelms you, use cover and health packs, then re-enter from a better position.',
    pickWhen:
      'Use this guide when you secure one pick and die chasing the second, burn ultimates to survive greed, or stay in fights a few seconds too long.',
    sections: [
      {
        title: 'Most Duelist deaths are overstays',
        points: [
          'The guide says many Duelist deaths are not about mechanics. They happen because players do not know when to leave.',
          'Players keep fighting because they assume someone will die, then they become the player who dies.',
          'A fight can start well and still flip against you.',
          'Once the fight flips, forcing more value can turn a good play into a lost trade.',
          'Overextending by only a little can be enough for the enemy to punish you.',
          'Good players keep evaluating whether the current fight is still good for them.',
        ],
      },
      {
        title: 'Signs it is time to leave',
        points: [
          'Leave if the kill is not guaranteed and you are risking your life to finish it.',
          'Leave when too much attention is on you and multiple enemies are shooting you at once.',
          'Leave when unexpected threats appear, including cooldowns, abilities, ultimates, or a defender getting the jump on you.',
          'If three people are focused on you, the fight is probably no longer favorable.',
          'Sometimes the strongest outplay is already being out of the way.',
          'You will still die sometimes, but the goal is to reduce preventable deaths.',
        ],
      },
      {
        title: 'Disengage does not mean run forever',
        points: [
          'Disengaging means resetting the fight, not abandoning all pressure.',
          'Health packs let Duelists recover without forcing supports to shift focus.',
          'Every Duelist who flanks or takes off-angles should learn health pack locations.',
          'Natural cover is another reset tool because breaking line of sight for a few seconds can remove pressure.',
          'Cover is especially important for characters without strong mobility.',
          'Abilities help, but positioning and awareness should come first. Mobility is the emergency card, not the whole plan.',
        ],
      },
      {
        title: 'Reset and re-enter',
        points: [
          'A good disengage gives you a better entry into the same fight.',
          'Back up, stabilize, and return once the timing improves.',
          'Surviving keeps pressure on the map and gives you another chance to create value.',
          'Some fights require multiple micro-disengages: reset position, avoid an ability, then re-enter when the timing works.',
          'Great Duelists are not only good at fighting. They are good at knowing when the fight is over for them.',
        ],
      },
    ],
    ultimates: [],
  },
  {
    heroId: 'duelist-target-priority',
    heroName: 'Duelist Target Priority',
    category: 'fundamentals',
    role: 'Fundamentals',
    image: '/images/heroes/star-lord.png',
    sourceLabel: 'Target Priority Explained duelist guide',
    sourceUrl: 'https://www.youtube.com/watch?v=zuvJYHK2rB0&list=PL5TQ7tktRWOAakGzPXBwS7Vwjs9bSIYLt',
    summary:
      'Target priority is not a fixed rule like always shooting supports. It is the real-time habit of solving the biggest fight problem you can actually reach.',
    poolJob:
      'Scan the fight, identify the current problem, decide whether you can reach it, and keep getting value while waiting for the best target to open.',
    pickWhen:
      'Use this guide when you tunnel one target, ignore the hero disrupting your team, or keep shooting what is visible instead of what is winning the fight.',
    sections: [
      {
        title: 'Priority changes mid-fight',
        points: [
          'The guide says your target priority is often not wrong. It is outdated because the fight changed.',
          'High-elo Duelists are not locked onto one target all fight.',
          'They adapt in real time as the fight changes.',
          'Target priority means choosing who gives your role the most value in that moment.',
          'It is not always supports, not always tanks, and not always the Duelist pressuring your team.',
          'The correct target is whatever is stopping your team from winning the fight right now.',
        ],
      },
      {
        title: 'Shoot the problem, not just the visible target',
        points: [
          'A major mistake is shooting what is directly in front of you instead of what is causing the problem.',
          'If a tank is forward but cannot keep themselves alive without supports, the supports may become the priority.',
          'If a flanker is living in your backline, that flanker may become the priority.',
          'If a Duelist is uncontested and receiving constant healing, solving that support line may matter more than shooting the tank.',
          'If an enemy tank is taking too much space and your team cannot move, that tank may become the immediate problem.',
        ],
      },
      {
        title: 'Do not force priority through bad timing',
        points: [
          'Knowing the priority does not mean you can force it immediately.',
          'If someone peels you or contests your angle, reset and come back when the opportunity appears.',
          'You can keep a priority in mind while temporarily fighting a different target.',
          'Sometimes a teammate ultimate breaks enemy space and suddenly gives you access to a backline target you could not reach before.',
          'Sometimes the best value is cycling through whoever is actually hittable until your preferred target appears again.',
          'Strong Duelists stay locked onto the fight itself, not a single target name.',
        ],
      },
      {
        title: 'Peel can be the priority',
        points: [
          'Sometimes the biggest problem is not in the enemy backline. It is on your supports.',
          'If an enemy dives your Strategists, peeling them can become the correct priority.',
          'The guide frames target priority as solving the problem in front of your team.',
          'You may not get a flashy kill, but protecting the support line can keep the fight playable.',
          'If the situation turns unfavorable while peeling, reset instead of feeding into the same problem.',
        ],
      },
      {
        title: 'Three questions for every fight',
        points: [
          'Ask: what is the biggest problem right now?',
          'Ask: can I actually reach that problem safely?',
          'Ask: if I cannot reach it, what target gives me the most value instead?',
          'Target priority is developed through repetition until the game starts to slow down.',
          'The goal is to scan, adapt, and react in real time instead of memorizing one static target order.',
        ],
      },
    ],
    ultimates: [],
  },
  {
    heroId: 'duelist-off-angle-short',
    heroName: 'Duelist Off-Angles',
    category: 'fundamentals',
    role: 'Fundamentals',
    image: '/images/heroes/psylocke.png',
    sourceLabel: 'Duelist Off Angles short guide',
    sourceUrl: 'https://www.youtube.com/watch?v=LAWuwOuRM5E&list=PL5TQ7tktRWOAakGzPXBwS7Vwjs9bSIYLt',
    summary:
      'Off-angles let a Duelist attack from a second direction, split attention, and create the chaos that turns pressure into mistakes.',
    poolJob:
      'Take side, high-ground, or backline angles while keeping a health pack route and escape plan ready.',
    pickWhen:
      'Use this quick guide when you stack behind your tank too often or need a simple rule for creating Duelist pressure.',
    sections: [
      {
        title: 'Why off-angles work',
        points: [
          'Off-angles make the enemy fight your team in front while also reacting to you from the side, high ground, or backline.',
          'If nobody contests you, you may get free kills.',
          'If they do contest you, you still pull attention away from the main fight.',
          'Attention split creates hesitation, missed reactions, and positioning mistakes.',
        ],
      },
      {
        title: 'Play your life on the angle',
        points: [
          'Taking an off-angle does not mean feeding.',
          'Know the nearest health pack before committing.',
          'Have an escape plan every time you enter.',
          'If the enemy starts collapsing on you, reset and keep the pressure available for the next window.',
        ],
      },
    ],
    ultimates: [],
  },
  {
    heroId: 'dps-pressure-short',
    heroName: 'DPS Pressure Over Damage',
    category: 'fundamentals',
    role: 'Fundamentals',
    image: '/images/heroes/hawkeye.png',
    sourceLabel: 'DPS Pressure Over Damage short guide',
    sourceUrl: 'https://www.youtube.com/watch?v=qJhxR9jZaBY&list=PL5TQ7tktRWOAakGzPXBwS7Vwjs9bSIYLt',
    summary:
      'Predictable damage is easy to heal. Real DPS pressure comes from angles that force cooldowns, attention, resources, and mistakes.',
    poolJob:
      'Create a second threat, force enemy reactions, then reset before greed gives the enemy a trade.',
    pickWhen:
      'Use this quick guide when you are farming damage from main instead of forcing resources from better angles.',
    sections: [
      {
        title: 'Predictable damage is easy to heal',
        points: [
          'Standing behind your tank all game makes your damage predictable.',
          'Predictable damage is easier for supports to heal through.',
          'DPS pressure is not only about raw numbers. It is about making enemy decisions harder.',
          'An off-angle can force support abilities, attention, ultimates, and cooldowns even without a kill.',
        ],
      },
      {
        title: 'Take the value and reset',
        points: [
          'The guide warns that greed kills more DPS players than the enemy team does.',
          'Take the angle, force the cooldowns, and reset.',
          'If kills appear during that pressure, take them, but do not give yourself up for extra damage.',
          'Grab health packs and re-enter when a new opportunity appears.',
        ],
      },
    ],
    ultimates: [],
  },
  {
    heroId: 'duelist-disengage-short',
    heroName: 'Duelist Reset Rules',
    category: 'fundamentals',
    role: 'Fundamentals',
    image: '/images/heroes/black-cat.png',
    sourceLabel: 'Duelist Disengaging short guide',
    sourceUrl: 'https://www.youtube.com/watch?v=W6uvOtZJK-I&list=PL5TQ7tktRWOAakGzPXBwS7Vwjs9bSIYLt',
    summary:
      'Duelists should constantly ask whether the fight is still theirs. If the answer changes, reset instead of forcing value.',
    poolJob:
      'Abandon risky kills, grab health packs, use cover, and re-enter fights on your own terms.',
    pickWhen:
      'Use this quick guide when you need a simple reminder that disengaging is a reset, not a failure.',
    sections: [
      {
        title: 'Leave when the fight flips',
        points: [
          'If the fight stops being favorable, the Duelist job is to reset.',
          'A low enemy is not always worth chasing if you can die too.',
          'Getting one kill does not mean you should overstay.',
          'Sometimes the smartest play is abandoning the fight entirely because the cards are no longer in your favor.',
        ],
      },
      {
        title: 'Health packs are your third support',
        points: [
          'Health packs let you reset without draining your Strategists.',
          'Learn health pack routes on maps where you flank or off-angle.',
          'Disengaging can mean backing up briefly, recovering, and re-entering from a stronger position.',
          'The point is to take the next fight on your terms.',
        ],
      },
    ],
    ultimates: [],
  },
  {
    heroId: 'target-priority-short',
    heroName: 'Target Priority Quick Guide',
    category: 'fundamentals',
    role: 'Fundamentals',
    image: '/images/heroes/star-lord.png',
    sourceLabel: 'Duelist Target Priority short guide',
    sourceUrl: 'https://www.youtube.com/watch?v=Ki4D-8EAUps&list=PL5TQ7tktRWOAakGzPXBwS7Vwjs9bSIYLt',
    summary:
      'Target priority changes mid-fight. The right target is the one solving the current problem, not always the one you planned to shoot.',
    poolJob:
      'Change angles, identify the problem, shoot what creates value, and keep cycling targets as the fight evolves.',
    pickWhen:
      'Use this quick guide when you tunnel one target or keep shooting the tank while the real problem stays untouched.',
    sections: [
      {
        title: 'Priority is not fixed',
        points: [
          'If shooting the tank is not moving the fight, change your angle and find the target that matters.',
          'A support may become the priority if they are keeping the frontline alive.',
          'A backline DPS may become the priority if they are controlling your team.',
          'Sometimes whoever falls into your line of sight is the right temporary target because they are available now.',
        ],
      },
      {
        title: 'Solve the fight in front of you',
        points: [
          'The guide summarizes target priority as solving the problem in front of you.',
          'Do not chase a theoretical perfect target if the fight gives you a better immediate option.',
          'Recognize the shift mid-fight and act before the opportunity disappears.',
        ],
      },
    ],
    ultimates: [],
  },
];
