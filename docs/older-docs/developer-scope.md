� Developer Scope – GamePlan AI MVP (Prompt-Based
Betting Assistant)
Objective:
Build a web app where users type in natural-language betting prompts and receive AI-generated
play suggestions (e.g., props, long-shot parlays, single-game picks) using GPT-4 and GoalServe.
The platform includes user authentication, subscription control, prompt-based play
generation, and a personal play tracker.
Note: GamePlan AI does not support betting. It offers data-informed suggestions for
informational purposes only.
� Authentication & Access Control (NeonDB)
• Email/password sign-up & login
• Store user tier: Free, Core ($49), Pro ($99)
• Track daily prompt usage
• Restrict access based on plan tier
� Prompt-to-Play Flow
1. User types a prompt
◦ Examples:
▪ “Give me a 3-leg MLB long shot parlay for tonight”
▪ “What’s the best player prop in the NBA today?”
▪ “Find me a team total underdog play in NHL”
2. GPT-4 parses prompt
◦ Extracts:
▪ Sport, bet type, date, prop or parlay info
▪ Filters like “long shot,” “underdog,” “home team”
3. GoalServe API fetch
◦ Pull relevant player/team stats, upcoming matchups, odds context
◦ Feed that data into GPT response
4. GPT formats structured result
◦ ✅ Suggested play(s)
◦ � Supporting reasoning
◦ � Option to regenerate
� Frontend UI (Netlify.dev)
• Prompt input page
• Output display block with:
◦ Play recommendation
◦ Reasoning summary
◦ Buttons: Regenerate, Save to Tracker
� User Tracker Feature (MVP)
• “Save Pick” button → logs play to user’s tracker
• Tracker screen (My Picks):
◦ List of saved plays with:
▪ Play type (e.g., “Curry O2.5 threes”)
▪ Date received
▪ Prompt it came from
▪ User can toggle status: “Pending,” “Hit,” or “Miss”
• NeonDB schema: picks are user-specific and only visible to them
� Stripe Subscription Logic
• Free: 3 prompts/day
• Core: $49/month — 15 prompts/day, full tracker
• Pro: $99/month — 30 prompts/day, full tracker, advanced props & parlays
• Stripe monthly + annual billing
• Plan and usage limit enforced via NeonDB
� NeonDB Backend
• Tables:
◦ users (id, email, stripe_plan, daily_prompt_count)
◦ prompt_logs (user_id, prompt_text, response, timestamp)
◦ saved_picks (user_id, play_text, received_on, status)
� Stack Summary
• Frontend: netlify + React + Tailwind + shadcn/ui
• Backend/Auth: NeonDB
• AI: GPT-4 Turbo (OpenAI API)
• Sports Data: GoalServe (USA Sports Package)
• Billing: Stripe Subscriptions
� Legal/UX
• No betting features
• Prominently display disclaimer:
GamePlan AI generates picks for informational purposes only. It is not a betting platform
or affiliated with sportsbooks.