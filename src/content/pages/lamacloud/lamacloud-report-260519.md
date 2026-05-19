---
title: "LamaCloud Incident Report #00"
date: 2026-05-19T00:00:00+08:00
tags: ["lamacloud"]
---

# LamaCloud Incident Report \#00

## 1. Overview
* **Incident ID:** 00
* **Impacted Devices:** LamaCloud-BJ01-PVEHost
* **Date and Time of Incident:** [2026-05-19 10:00 AM UTC+8]
* **Date and Time of Resolution:** [2026-05-19 3:30 PM UTC+8]
* **Report Author:** lamadaemon


## 2. Executive Summary

```ansi title="Server hardware changes" frame="terminal"
[2m[[0m[38;2;239;83;80m-[0m[2m][0m 4T HDD
[2m[[0m[38;2;239;83;80m-[0m[2m][0m GTX 1050 Ti
[2m[[0m[38;2;34;218;110m+[0m[2m][0m GTX 1050 Ti
[2m[[0m[38;2;239;83;80m-[0m[2m][0m Power jump wires
[2m[[0m[38;2;34;218;110m+[0m[2m][0m Power jump wires
[2m[[0m[38;2;239;83;80m-[0m[2m][0m Power Extension cords
[2m[[0m[38;2;34;218;110m+[0m[2m][0m New Power Extension cords
[2m[[0m[38;2;34;218;110m+[0m[2m][0m Remote controlling power adapter
```

### Server AC Power Grounding Issue
Several days ago, the owner, lamadaemon, discovered that the server cluster is not grounded properly, causing an induced voltage to accumulate on the Earth line. 
This grounding issue will impact the stability of the existing ethernet cables. 
However, due to Cannikin law, this will not have any negative impacts. 
Still, since having a strong induced voltage on the Earth cable is very dangerous and may cause damage to precious human resources, 
an investigation has been done by an unprofessional electrician in order to negate the risk of losing a professional one.
The results are: the power plug has a high chance of not having the Earth connected; it is hard to connect the Earth back; further investigation is required to formulate a final solution.

### Future plans
Previously, the owner had proposed an update to the current graphics card, that is, keep GTX 1050 Ti installed while adding his spare RX 5700 XTX Sapphire. 
However, after a careful evaluation, the owner has come to the conclusion that this is impossible,
so the owner made three alternative plans with a poll for democracy. Dummy personalities simulated by Gemini Pro 3.1 have been used for this poll for convenience, and the results are shown below:

```
================================================================================
                 POLL: HARDWARE UPGRADE AND ALLOCATION STRATEGY
================================================================================

Total Votes Cast: 248

Option 1: Replace 1050 Ti w/ RX 5700 XT
[█████---------------------------------------------] 11.3% (28 votes)

Option 2: 1050 Ti on x4 slot, RX 5700 on x16
[███-----------------------------------------------]  6.5% (16 votes)

Option 3: Give up & sell your fucking bitcoin mining card
[█████████████████████████████████████████---------] 82.2% (204 votes)

================================================================================
STATUS: CLOSED | WINNING OUTCOME: OPTION 3
================================================================================
```

The option will be conducted soon, without further notice, unless expected inconveniences occur.

## 3. Incident Impact
* **Affected Services:** vm.lama.icu, git.lama.icu, ci.lama.icu, and all Virtual Machines on PVE
* **Duration of Outage:** Do the math yourself, and
* **Customer Impact:** Fuck you
* **Data Integrity:** Everything is lost and fuck you
