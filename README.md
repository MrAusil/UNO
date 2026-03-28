# UNO Multiplayer — Frontend

A production-ready multiplayer UNO game frontend built with Next.js 14, TypeScript, Socket.IO, and Zustand.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| State | Zustand |
| Realtime | Socket.IO Client |
| Animation | Framer Motion |
| Confetti | canvas-confetti |
| Icons | lucide-react |
| Utilities | clsx, react-use |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout + metadata
│   ├── page.tsx                # Landing page (create/join)
│   └── room/[roomCode]/
│       └── page.tsx            # Room page (lobby + game)
│
├── components/
│   ├── animations/
│   │   └── FloatingCards.tsx   # Landing page background
│   ├── cards/
│   │   ├── Card.tsx            # UNO card component
│   │   └── CardBack.tsx        # Card back / draw pile
│   ├── game/
│   │   ├── GameBoard.tsx       # Main game layout
│   │   ├── GameTable.tsx       # Center table (deck + discard)
│   │   ├── PlayerHand.tsx      # Local player's hand
│   │   ├── OpponentPlayer.tsx  # Other players display
│   │   ├── TurnTimer.tsx       # Countdown timer
│   │   ├── UnoButton.tsx       # UNO call + challenge
│   │   ├── Chat.tsx            # In-game chat
│   │   ├── ColorPickerModal.tsx # Wild card color picker
│   │   └── WinScreen.tsx       # Game over + confetti
│   ├── lobby/
│   │   ├── Lobby.tsx           # Waiting room
│   │   └── RoomSettingsPanel.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── Tooltip.tsx
│       └── ConnectionError.tsx
│
├── hooks/
│   ├── useSocket.ts            # Socket.IO setup + all event handlers
│   ├── useGameState.ts         # Derived game state selectors
│   └── useRoom.ts              # Room actions (create/join/leave/kick)
│
├── store/
│   ├── gameStore.ts            # Room + game state + UI flags
│   ├── playerStore.ts          # Local player + hand (persisted)
│   └── socketStore.ts          # Connection state
│
├── lib/
│   ├── socket.ts               # Socket.IO singleton
│   ├── api.ts                  # REST API utility
│   └── constants.ts            # Colors, events, defaults
│
├── types/
│   ├── game.ts                 # Card, GameState, ChatMessage…
│   ├── player.ts               # Player type + avatars
│   ├── room.ts                 # Room, RoomSettings
│   └── socket.ts               # ServerToClient + ClientToServer events
│
└── utils/
    ├── cardUtils.ts            # canPlayCard, sorting, labels…
    ├── animationUtils.ts       # Framer Motion variants
    └── soundManager.ts         # Web Audio API sounds
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit NEXT_PUBLIC_SOCKET_URL to point to your backend
```

### 3. Run development server

```bash
npm run dev
```

---

## Socket.IO Integration

### Backend expects these events from the client:

| Event | Payload | Description |
|---|---|---|
| `create_room` | `{ playerName, avatar, settings? }` | Create a new room |
| `join_room` | `{ roomCode, playerName, avatar }` | Join existing room |
| `leave_room` | — | Leave current room |
| `start_game` | — | Host starts the game |
| `play_card` | `{ cardId, chosenColor? }` | Play a card |
| `draw_card` | — | Draw from deck |
| `choose_color` | `{ color }` | Choose wild color |
| `call_uno` | — | Call UNO! |
| `challenge_uno` | `{ targetPlayerId }` | Challenge UNO |
| `send_chat` | `{ message }` | Send chat message |
| `set_ready` | `{ isReady }` | Toggle ready state |
| `update_settings` | `Partial<RoomSettings>` | Update room settings |
| `kick_player` | `{ playerId }` | Kick a player (host only) |

### Frontend listens for these server events:

| Event | Description |
|---|---|
| `player_join` | Player joined room |
| `player_leave` | Player left room |
| `room_update` | Room state changed |
| `game_start` | Game has started |
| `deal_cards` | Cards dealt to player |
| `card_played` | A card was played |
| `draw_cards` | Cards were drawn |
| `turn_change` | Turn changed to another player |
| `color_selected` | Wild color chosen |
| `uno_called` | Player called UNO |
| `game_over` | Game ended with winner |
| `chat_message` | New chat message |
| `timer_update` | Turn timer tick |
| `error` | Server error |
| `settings_updated` | Room settings updated |
| `player_ready` | Player ready status changed |
| `player_kicked` | Player was kicked |

---

## Features

- 🎴 **Full UNO card system** — all card types with color-coded UI
- 🔌 **Socket.IO ready** — clean event architecture for any backend
- 🎯 **Zustand state** — normalized, efficient state updates
- 🎬 **Framer Motion** — card animations, player join effects, win screen
- 🎉 **Confetti** — canvas-confetti on game win
- 🔊 **Web Audio** — procedural sound effects (no assets needed)
- 💬 **Chat** — in-lobby and in-game real-time chat
- ⏱️ **Turn timer** — visual countdown with color feedback
- 🃏 **UNO button** — auto-shows at 1 card, challenge system
- 🎨 **Color picker** — modal for wild cards
- 📱 **Responsive** — mobile-first layout
- ♿ **Accessible** — ARIA labels, keyboard navigation, focus styles
- 🔇 **Sound toggle** — persistent sound preference

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:3001` | Backend WebSocket server URL |
