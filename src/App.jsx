import React, { useState, useEffect } from "react";

import { db } from "./firebase";

import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where
} from "firebase/firestore";

const PLAYERS = [
  "Scott Jr",
  "Scott Sr",
  "Georgia",
  "Irene",
  "Claire",
  "Ryan"
];

const VALID_PLAYERS = {
  "scott jr": "Scott Jr",
  "scott sr": "Scott Sr",
  georgia: "Georgia",
  irene: "Irene",
  claire: "Claire",
  ryan: "Ryan"
};

const PLAYER_COLORS = {
  "Scott Jr": "#22c55e",
  "Scott Sr": "#f97316",
  Georgia: "#ec4899",
  Irene: "#a855f7",
  Claire: "#3b82f6",
  Ryan: "#ef4444"
};

const SQUARES = [
  "Worst Sunburn Award",
  "Fat Elvis",
  "Bachelor Party",
  "Bachelorette Party",

  "Drinking Before 9am",
  "Fastest Drink Finished",
  "Influencer Vlogging",
  "Waymo Chaos",

  "Lambo",
  "Selfie Stick",
  "Funniest Sleeping Photo",
  "Bride in Wedding Dress",
  "Wedding Chapel",
  "Groom in Wedding Attire",
  "Tattoo Shop",
  "Celtic Shirt",
  "Biggest Gambling Loss",

  "Biggest Gambling Win",
  "Rangers Shirt",
  "Matching Shirts (4+)",
  "Asleep at Slot Machine",

  "Wearing a Kilt",
  "First to Lose Room Key",
  "Socks with Sandals",
  "Neck Pillow Tourist Nowhere Near Airport",

  "Georgia Lookalike",
  "Scott Jr Lookalike",
  "Most Steps Walked",
  "Scott Sr Lookalike",

  "Irene Lookalike",
  "Claire Lookalike",
  "Ryan Lookalike",
  "Tackiest Souvenir ($10)"
  
];

export default function App() {
  const [player, setPlayer] = useState(
    localStorage.getItem("vegas-player") || ""
  );

  const [guestName, setGuestName] = useState("");

  const [found, setFound] = useState({});
  const [screen, setScreen] = useState("board");
  const [leaderboard, setLeaderboard] = useState([]);
  const [owners, setOwners] = useState({});
  const [activity, setActivity] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [selectedSquare, setSelectedSquare] =
  useState(null);

// square ownership listener
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "squareOwners"),
    (snapshot) => {
      const data = {};

      snapshot.forEach((docSnap) => {
        data[docSnap.id] =
          docSnap.data().owner;
      });

      setOwners(data);
    }
  );

  return () => unsubscribe();
}, []);

// activity listener
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "activity"),
    (snapshot) => {
      const items = [];

      snapshot.forEach((docSnap) => {
        items.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });

      items.sort((a, b) => {
        const aTime =
          a.timestamp?.seconds || 0;
        const bTime =
          b.timestamp?.seconds || 0;

        return bTime - aTime;
      });

      setActivity(items);
    }
  );

  return () => unsubscribe();
}, []);
  
 useEffect(() => {
  const scores = PLAYERS.map((name) => ({
    name,
    score: Object.values(owners)
      .filter((owner) => owner === name)
      .length
  }));

  scores.sort(
    (a, b) => b.score - a.score
  );

  setLeaderboard(scores);
}, [owners]);

  useEffect(() => {
    const loadPlayer = async () => {
      if (!player) return;

      const ref = doc(db, "players", player);

      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setFound(data.found || {});
      } else {
        setFound({});
      }

      setLoaded(true);
    };

    setLoaded(false);
    loadPlayer();
  }, [player]);

const toggleSquare = async (square) => {
  const owner = owners[square];

  if (owner === player) {
    await deleteDoc(
      doc(db, "squareOwners", square)
    );

    const q = query(
  collection(db, "activity"),
  where("player", "==", player),
  where("square", "==", square),
  where("action", "==", "claimed")
);

const snapshot = await getDocs(q);

for (const activityDoc of snapshot.docs) {
  await deleteDoc(activityDoc.ref);
}

    setOwners((prev) => {
      const copy = { ...prev };
      delete copy[square];
      return copy;
    });

    return;
  }

  if (owner && owner !== player) {
    return;
  }
const squareRef = doc(
  db,
  "squareOwners",
  square
);

const squareSnap = await getDoc(squareRef);

if (
  squareSnap.exists() &&
  squareSnap.data().owner !== player
) {
  return;
}
  await setDoc(
  doc(db, "squareOwners", square),
  {
    owner: player
  }
);

await addDoc(
  collection(db, "activity"),
  {
    player,
    square,
    action: "claimed",
    timestamp: serverTimestamp()
  }
);

  setOwners((prev) => ({
    ...prev,
    [square]: player
  }));
};

  const changePlayer = () => {
  localStorage.removeItem(
    "vegas-player"
  );

  setPlayer("");
  setGuestName("");
};

 const resetBoard = async () => {
  if (
    !window.confirm(
      "Remove all your claimed squares?"
    )
  ) {
    return;
  }

  const snapshot = await getDocs(
  collection(db, "squareOwners")
);

  for (const squareDoc of snapshot.docs) {
  await deleteDoc(squareDoc.ref);
}
   const activitySnapshot = await getDocs(
  collection(db, "activity")
);

for (const activityDoc of activitySnapshot.docs) {
  await deleteDoc(activityDoc.ref);
}
};

const count = Object.values(owners)
  .filter((owner) => owner === player)
  .length;

  const percent = Math.round(
    (count / SQUARES.length) * 100
  );

  const bingo = count >= 16;

  if (!player) {
  return (
    <div className="app">
    <div className="progressTitle">
      VEGAS 26
    </div>

      <h2>👤 VIP Guest List</h2>

      <p
        style={{
          textAlign: "center",
          marginBottom: "20px"
        }}
      >
        Are you on the list?
      </p>

      <input
        type="text"
        value={guestName}
        onChange={(e) =>
          setGuestName(e.target.value)
        }
        placeholder="Type your name..."
        style={{
          display: "block",
          width: "100%",
          maxWidth: "350px",
          margin: "0 auto 20px",
          padding: "14px",
          borderRadius: "12px",
          border: "2px solid #ff4fc3",
          background: "#111",
          color: "white",
          textAlign: "center",
          fontSize: "1rem"
        }}
      />

      <button
        className="playerBtn"
        onClick={() => {
          const name =
            guestName
              .trim()
              .toLowerCase();

          const matchedPlayer =
            VALID_PLAYERS[name];

          if (!matchedPlayer) {
            alert(
              "🚫 Sorry, you're not on the guest list."
            );
            return;
          }

          localStorage.setItem(
            "vegas-player",
            matchedPlayer
          );

          setPlayer(
            matchedPlayer
          );
        }}
      >
        🎲 Enter Casino
      </button>
    </div>
  );
}

  return (
    <div className="app">
      <div className="progressTitle">
  VEGAS 26
</div>

      <div className="playerTag">
  Playing as:
  <br />
  <strong>{player}</strong>
</div>

      {screen === "board" && (
        <>
          {bingo && (
            <div className="bingoBanner">
              🎉 BINGO ACHIEVED! 🎉
            </div>
          )}

          <div className="progressCard">
  <div className="progressCount">
    {count} / {SQUARES.length}
  </div>
</div>

<div className="progress">
  <div
    className="progressFill"
    style={{
      width: `${percent}%`
    }}
  />
</div>
          
<div className="grid">
  {SQUARES.map((square) => (
<button
  key={square}
  className="square"
  style={{
    borderColor: owners[square]
      ? PLAYER_COLORS[owners[square]]
      : undefined,

    boxShadow: owners[square]
      ? `0 0 12px ${PLAYER_COLORS[owners[square]]}`
      : undefined
  }}
 onClick={() => {
  if (owners[square] === player) {
    toggleSquare(square);
  } else {
    setSelectedSquare(square);
  }
}}
>
  <div>
    <div>{square}</div>

    {owners[square] && (
  <div
    style={{
      marginTop: "8px",
      fontSize: "0.95rem",
      fontWeight: "bold",
      color:
        PLAYER_COLORS[
          owners[square]
        ],
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "5px"
    }}
  >
    <span>●</span>
    <span>{owners[square]}</span>
  </div>
)}
  </div>
</button>
  ))}
</div>
        </>
      )}

      {screen === "leaderboard" && (
        <div className="leaderboard">
          <h2>🏆 Leaderboard</h2>

        {leaderboard.map((entry, index) => (
  <div
    key={entry.name}
    className="leaderRow"
    style={
  index === 0
    ? {
        border: "1px solid #fbbf24",
        boxShadow:
          "0 0 12px rgba(251,191,36,0.4)"
      }
    : index === 1
    ? {
        border: "1px solid #cbd5e1",
        boxShadow:
          "0 0 10px rgba(203,213,225,0.3)"
      }
    : index === 2
    ? {
        border: "1px solid #cd7f32",
        boxShadow:
          "0 0 10px rgba(205,127,50,0.3)"
      }
    : {}
}
  >
    <span>
      {index === 0
        ? "🥇 "
        : index === 1
        ? "🥈 "
        : index === 2
        ? "🥉 "
        : `${index + 1}. `}
      {entry.name}
    </span>

    <strong>{entry.score}</strong>
  </div>
))}

        </div>
      )}

{screen === "activity" && (
  <div className="leaderboard">
    <h2>📢 Activity</h2>

    {activity.map((item) => (
      <div
        key={item.id}
        className="leaderRow"
      >
        <span
          style={{
            color:
              PLAYER_COLORS[
                item.player
              ]
          }}
        >
          ● {item.player}
        </span>

        <span>
          {item.action === "claimed"
            ? `claimed ${item.square}`
            : `removed ${item.square}`}
        </span>
      </div>
    ))}
  </div>
)}
      {selectedSquare && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999
    }}
  >
    <div
      style={{
        background: "#111",
        border: "2px solid #ff4fc3",
        borderRadius: "20px",
        padding: "20px",
        width: "90%",
        maxWidth: "400px",
        textAlign: "center"
      }}
    >
      <h2
  style={{
    fontSize: "1.6rem",
    marginBottom: "20px",
    color: "#ff4fc3"
  }}
>
  🎰 {selectedSquare}
</h2>

     <div
  style={{
    fontSize: "1.1rem",
    fontWeight: "bold",
    marginBottom: "10px",
    color: owners[selectedSquare]
      ? PLAYER_COLORS[
          owners[selectedSquare]
        ]
      : "#aaa"
  }}
>
  👤 {owners[selectedSquare] || "Nobody"}
</div>
<p
  style={{
    opacity: 0.7,
    marginBottom: "20px"
  }}
>
  📸 No evidence uploaded yet
</p>

<button
  disabled
  style={{
    opacity: 0.5,
    marginBottom: "15px"
  }}
>
  📷 View Evidence
</button>
      {!owners[selectedSquare] && (
  <button
    onClick={() => {
      toggleSquare(selectedSquare);
      setSelectedSquare(null);
    }}
  >
    Claim Square
  </button>
)}

      <button
        onClick={() =>
          setSelectedSquare(null)
        }
        style={{
          marginLeft: "10px"
        }}
      >
        Close
      </button>
    </div>
  </div>
)}

     {screen === "board" && (
  <>
    <button
      className="logoutBtn"
      onClick={changePlayer}
    >
      🚪 Cut Your Losses
    </button>

    {player === "Scott Jr" && (
      <button
        className="logoutBtn"
        onClick={resetBoard}
      >
        👑 Admin Reset
      </button>
    )}
  </>
)}
      
      <div className="bottomNav">
      <button
  style={{
    color:
      screen === "board"
        ? "#ff4fc3"
        : "white"
  }}
  onClick={() =>
    setScreen("board")
  }
>
  <div>🎰</div>
  <div>Board</div>
</button>
        <button
  style={{
    color:
      screen === "leaderboard"
        ? "#22c55e"
        : "white"
  }}
  onClick={() =>
    setScreen("leaderboard")
  }
>
          <div>🏆</div>
          <div>Scores</div>
        </button>

       <button
  style={{
    color:
      screen === "activity"
        ? "#f97316"
        : "white"
  }}
  onClick={() =>
    setScreen("activity")
  }
>
  <div>📢</div>
  <div>Feed</div>
</button>
      
      </div>
    </div>
  );
}
