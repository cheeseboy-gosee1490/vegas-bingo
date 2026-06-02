import React, { useState, useEffect } from "react";

import { db } from "./firebase";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
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
  "Elvis Impersonator",
  "Bachelor Party",
  "Bachelorette Party",

  "Drinking Before 9am",
  "Fastest Drink Finished",
  "Influencer Vlogging",
  "Waymo Chaos",

  "Lamborghini",
  "Selfie Stick",
  "Funniest Sleeping Photo",
  "Bride in Wedding Dress",

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

    setOwners((prev) => {
      const copy = { ...prev };
      delete copy[square];
      return copy;
    });

    return;
  }

  await setDoc(
    doc(db, "squareOwners", square),
    {
      owner: player
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
    if (
      squareDoc.data().owner === player
    ) {
      await deleteDoc(squareDoc.ref);
    }
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
      <h1>🎰 Vegas Bingo 2026</h1>

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
      <h1>🎰 Vegas Bingo 2026</h1>

      <div className="playerTag">
        Playing as: <strong>{player}</strong>
      </div>

      <div className="topButtons">
        <button onClick={changePlayer}>
          🚪 Cut Your Losses
        </button>

        <button onClick={resetBoard}>
          Reset Board
        </button>
      </div>

      {screen === "board" && (
        <>
          {bingo && (
            <div className="bingoBanner">
              🎉 BINGO ACHIEVED! 🎉
            </div>
          )}

          <div className="progress">
            <div
              className="progressFill"
              style={{
                width: `${percent}%`
              }}
            />
          </div>

          <p>
            {count}/{SQUARES.length} Found ({percent}%)
          </p>
          
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
  onClick={() =>
    toggleSquare(square)
  }
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

          {leaderboard.map(
            (entry, index) => (
              <div
                key={entry.name}
                className="leaderRow"
              >
                <span>
                  {index + 1}. {entry.name}
                </span>

                <strong>
                  {entry.score}
                </strong>
              </div>
            )
          )}
        </div>
      )}

      {screen === "activity" && (
  <div className="leaderboard">
    <h2>📢 Activity</h2>

    <div className="leaderRow">
      Activity feed coming next...
    </div>
  </div>
)}
      {screen === "photos" && (
        <div className="leaderboard">
          <h2>📸 Photos</h2>

          <div className="leaderRow">
            Photo uploads coming next...
          </div>
        </div>
      )}

      {screen === "settings" && (
        <div className="leaderboard">
          <h2>⚙️ Settings</h2>

          <div className="leaderRow">
  VIP Access Only
</div>

          <div className="leaderRow">
            Players: 6
          </div>
        </div>
      )}

      <div className="bottomNav">
        <button
          onClick={() =>
            setScreen("board")
          }
        >
          🎰 Board
        </button>

        <button
          onClick={() =>
            setScreen("leaderboard")
          }
        >
          🏆 Leaderboard
        </button>

       <button
  onClick={() =>
    setScreen("activity")
  }
>
  📢 Activity
</button>
        
        <button
          onClick={() =>
            setScreen("photos")
          }
        >
          📸 Photos
        </button>

        <button
          onClick={() =>
            setScreen("settings")
          }
        >
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}
