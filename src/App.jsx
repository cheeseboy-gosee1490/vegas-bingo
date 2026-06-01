import React, { useState, useEffect } from "react";

import { db } from "./firebase";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs
} from "firebase/firestore";

const PLAYERS = [
  "Scott Jr",
  "Scott Sr",
  "Georgia",
  "Irene",
  "Claire",
  "Ryan"
];

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

  const [found, setFound] = useState({});
  const [screen, setScreen] = useState("board");
  const [leaderboard, setLeaderboard] = useState([]);
  const [owners, setOwners] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
  const loadOwners = async () => {
    const snapshot = await getDocs(
      collection(db, "squareOwners")
    );

    const data = {};

    snapshot.forEach((docSnap) => {
      data[docSnap.id] =
        docSnap.data().owner;
    });

    setOwners(data);
  };

  loadOwners();
}, []);
  
  useEffect(() => {
    const loadLeaderboard = async () => {
      const snapshot = await getDocs(
        collection(db, "players")
      );

      const scores = [];

      snapshot.forEach((playerDoc) => {
        const data = playerDoc.data();

        scores.push({
          name: playerDoc.id,
          score: data.score || 0
        });
      });

      scores.sort(
        (a, b) => b.score - a.score
      );

      setLeaderboard(scores);
    };

    loadLeaderboard();
  }, [found]);

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

  useEffect(() => {
    const savePlayer = async () => {
      if (!player || !loaded) return;

      await setDoc(
        doc(db, "players", player),
        {
          found,
          score:
            Object.values(found).filter(Boolean)
              .length
        },
        { merge: true }
      );
    };

    savePlayer();
  }, [found, player, loaded]);

  const toggleSquare = (square) => {
    setFound((prev) => ({
      ...prev,
      [square]: !prev[square]
    }));
  };

  const changePlayer = () => {
    localStorage.removeItem("vegas-player");
    setPlayer("");
    setFound({});
    setLoaded(false);
  };

  const resetBoard = () => {
    if (
      window.confirm("Reset all progress?")
    ) {
      setFound({});
    }
  };

  const count =
    Object.values(found).filter(Boolean)
      .length;

  const percent = Math.round(
    (count / SQUARES.length) * 100
  );

  const bingo = count >= 16;

  if (!player) {
    return (
      <div className="app">
        <h1>🎰 Vegas Bingo 2026</h1>

        <h2>Select Player</h2>

        {PLAYERS.map((p) => (
          <button
            key={p}
            className="playerBtn"
            onClick={() => {
              localStorage.setItem(
                "vegas-player",
                p
              );
              setPlayer(p);
            }}
          >
            {p}
          </button>
        ))}
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
          Change Player
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
      className={
        owners[square]
          ? "square found"
          : found[square]
          ? "square found"
          : "square"
      }
      onClick={() =>
        toggleSquare(square)
      }
    >
      {square}
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
            Room Code: VEGAS26
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
