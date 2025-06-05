🧠 User Mindset
● Users aren’t asking for stats, explanations, or guidance — they’re asking the AI to build
bets for them based on what they’re thinking.
● They speak casually, using betting terms like "parlay," "over," "props," and "legs"
naturally in the sentence.
● The AI needs to understand the intent, pull the right data from GoalServe, and return a
structured play suggestion with some logic.
🎯 Real Prompt Examples by Type
🔹 Player-Focused Prompts
● “Can you build me a parlay that includes Giannis points?”
● “Give me something with Tatum hitting 3 threes tonight”
● “I want a player prop bet with Embiid rebounds”
● “Find me something with Judge hitting a home run”
🔹 Team-Focused Prompts
● “Make a same game parlay for Celtics vs Bucks”
● “Give me a Yankees play with team total over”
● “Build a parlay around the 49ers tonight”
● “Anything good with the Leafs scoring first?”
🔹 Parlay Builders
● “Build a 5-leg parlay with player props”
● “Give me a 3-leg same game parlay for tonight’s NBA games”
● “Make a long shot parlay for MLB — I want a big payout”
● “Something with 2 overs and a team to win”
🔹 Prop-Based Prompts
● “Any decent assist props today?”
● “Can you mix in 2 rebound props and a points prop?”
● “Find me 3 player props for tonight”
● “Touchdown scorer parlay for Sunday?”
🔹 Risk or Value Prompts
● “Give me a safe 2-leg bet for the NBA slate”
● “Show me a long shot prop parlay”
● “I want plus money, but not a crazy risk”
● “Mix a lock and a risky leg together”
🔹 Time-Based Prompts
● “Only give me plays for tonight”
● “Afternoon MLB games only”
● “What’s good for the early slate?”
● “Sunday night football bet builder”
🔄 What the System Should Do
1. Parse the prompt
○ Identify players, teams, number of legs, bet type (prop, parlay), risk profile, time
window
2. Call GoalServe API
○ Pull relevant games, stats, player info
3. Feed that into GPT
○ Generate structured bet suggestions
○ Example output:
Parlay Suggestion:
■ Giannis over 27.5 points
■ Bucks moneyline
■ Brook Lopez over 1.5 blocks
Why: Giannis has hit 28+ in 4 of last 5, Lopez is seeing more minutes,
and Bucks are on a 3-game win streak at home.
4. Display clearly in frontend
○ Include regenerate and save-to-tracker options