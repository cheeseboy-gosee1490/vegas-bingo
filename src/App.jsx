import React, { useState, useEffect } from "react";

import { db, storage } from "./firebase";

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

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import {
  LayoutGrid,
  Trophy,
  Bell,
  DoorOpen,
  Crown
} from "lucide-react";

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

  const [discoveryPopup, setDiscoveryPopup] =
  useState(null);

const [photo, setPhoto] = useState(null);
const [uploading, setUploading] = useState(false);

// square ownership listener
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "squareOwners"),
    (snapshot) => {
      const data = {};

      snapshot.forEach((docSnap) => {
  data[docSnap.id] =
    docSnap.data();
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
  a.timestamp?.toMillis?.() || 0;
const bTime =
  b.timestamp?.toMillis?.() || 0;

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
      .filter(
        (ownerData) =>
          ownerData?.owner === name
      )
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

const uploadPhoto = async (
  square,
  file
) => {
  
  const storageRef = ref(
    storage,
    `evidence/${square}-${Date.now()}`
  );

  await uploadBytes(
    storageRef,
    file
  );

  const url =
    await getDownloadURL(
      storageRef
    );

  return url;
};
  
const toggleSquare = async (
  square,
  photoUrl = null
) => {
  const owner = owners[square]?.owner;

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
    owner: player,
    photoUrl: photoUrl
  }
);

const playerCount =
  Object.values(owners)
    .filter(
      (ownerData) =>
        ownerData?.owner === player
    )
    .length + 1;

let achievement = null;

if (playerCount === 3) {
  achievement = "🎉 MINI BINGO";
} else if (playerCount === 5) {
  achievement = "🎰 BINGO";
} else if (playerCount === 10) {
  achievement = "🔥 DOUBLE BINGO";
} else if (playerCount === 20) {
  achievement = "💰 HIGH ROLLER";
} else if (playerCount === 25) {
  achievement = "👑 VEGAS LEGEND";
} else if (playerCount === 33) {
  achievement = "🏆 FULL HOUSE";
}

await addDoc(
  collection(db, "activity"),
  {
    player,
    square,
    action: "claimed",
    timestamp: serverTimestamp()
  }
);

  if (achievement) {
  await addDoc(
    collection(db, "activity"),
    {
      player,
      action: "achievement",
      achievement,
      timestamp: serverTimestamp()
    }
  );
  
  console.log(
  "SETTING OWNER PHOTO:",
  photoUrl
);
  
  setOwners((prev) => ({
  ...prev,
  [square]: {
    owner: player,
    photoUrl: photoUrl
  }
}));
}

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

const totalClaimed = Object.keys(owners).length;

const percent = Math.round(
  (totalClaimed / SQUARES.length) * 100
);

const remaining =
  SQUARES.length - totalClaimed;

  const playerCount = Object.values(owners)
  .filter(
    (ownerData) =>
      ownerData?.owner === player
  )
  .length;

const bingo = playerCount >= 16;

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
  <strong>
    PLAYING AS {player.toUpperCase()}
  </strong>
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

<div
  style={{
    textAlign: "center",
    marginTop: "10px",
    marginBottom: "20px"
  }}
>
  <div className="progressCount">
    {totalClaimed} / {SQUARES.length} Claimed
  </div>

  <div
    style={{
      fontSize: "0.9rem",
      opacity: 0.7
    }}
  >
    {remaining} Remaining
  </div>
</div>
          
<div className="grid">
  {SQUARES.map((square) => (
<button
  key={square}
  className="square"
  style={{
    borderColor: owners[square]?.owner
  ? PLAYER_COLORS[
      owners[square].owner
    ]
  : undefined,

boxShadow: owners[square]?.owner
  ? `0 0 12px ${
      PLAYER_COLORS[
        owners[square].owner
      ]
    }`
  : undefined
  }}
 onClick={() => {
  setSelectedSquare(square);
}}
>
  <div>
    <div>{square}</div>

    {owners[square]?.owner && (
  <div
    style={{
      marginTop: "8px",
      fontSize: "0.95rem",
      fontWeight: "bold",
      color:
        PLAYER_COLORS[
          owners[square].owner
        ],
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "5px"
    }}
  >
    <span>●</span>
    <span>{owners[square].owner}</span>
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
        {item.action === "achievement" ? (
  <span
    style={{
      fontWeight: "bold",
      color: "#fbbf24"
    }}
  >
    {item.achievement.split(" ")[0]} {item.player} achieved{" "}
    {item.achievement.substring(
      item.achievement.indexOf(" ") + 1
    )}
  </span>
) : (
  <>
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
  </>
)}
        
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
        position: "relative",
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
    color: owners[selectedSquare]?.owner
  ? PLAYER_COLORS[
      owners[selectedSquare].owner
    ]
  : "#aaa"
  }}
>
  👤 {owners[selectedSquare]?.owner || "Nobody"}
</div>
      
{owners[selectedSquare]?.photoUrl && (
 <div
    style={{
      position: "relative",
      display: "inline-block"
    }}
  >
{owners[selectedSquare]?.owner === player && (
  <button
    onClick={() => {
      toggleSquare(selectedSquare);
      setSelectedSquare(null);
    }}
    style={{
  position: "absolute",
  top: "10px",
  right: "10px",
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  padding: 0,
  fontSize: "20px"
}}
  >
    ✕
  </button>
)}
   
    <img
      src={owners[selectedSquare].photoUrl}
      alt="Evidence"
      width="200"
    />
  </div>
)}
      


{!owners[selectedSquare]?.owner && (    
<input
  type="file"
  accept="image/*"
  capture="environment"
  onChange={(e) => {

  setPhoto(
    e.target.files[0]
  );
}}
  style={{
    marginBottom: "15px"
   }}
 />
)}  
      {!owners[selectedSquare]?.owner && (
  <button
  onClick={async () => {

    if (photo) {

  try {
  const url = await uploadPhoto(
  selectedSquare,
  photo
);

console.log(
  "URL SENT:", 
  url
);
    
    await toggleSquare(
  selectedSquare,
  url
);

setDiscoveryPopup(
  selectedSquare
);

setSelectedSquare(null);
setPhoto(null);
    
  } catch (err) {
    alert(err.message);
    console.error(err);
  }
}

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
          display: "block",
          margin: "15px auto 0"
        }}
      >
        Close
      </button>
    </div>
  </div>
)}

     {screen === "board" && (
  <>
    <div style={{ marginTop: "20px" }}>
    <button
  className="logoutBtn"
  onClick={changePlayer}
>
  CUT YOUR LOSSES
</button>

    {player === "Scott Jr" && (
      <button
  className="logoutBtn"
  onClick={resetBoard}
>
  ADMIN RESET
</button>
    )}

       </div>
  </>
)}
{discoveryPopup && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.9)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}
  >
    <div
  style={{
    background: "#111",
    border: "3px solid #ff4fc3",
    borderRadius: "20px",
    padding: "30px",
    textAlign: "center",
    width: "90%",
    maxWidth: "400px",
    boxShadow:
      "0 0 25px rgba(255,79,195,0.5)"
  }}
>
      <h2
  style={{
    color: "#ff4fc3",
    fontSize: "2rem",
    marginBottom: "10px"
  }}
>
  {discoveryPopup.toUpperCase()}
</h2>

      <div
  style={{
    fontSize: "4rem",
    margin: "20px 0"
  }}
>
  🎰
</div>

<p
  style={{
    fontSize: "1.2rem",
    fontWeight: "bold"
  }}
>
  DISCOVERED!
</p>

      <button
        onClick={() =>
          setDiscoveryPopup(null)
        }
      >
        Continue
      </button>
    </div>
  </div>
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
  <LayoutGrid size={22} />
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
          <Trophy size={26} />
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
  <Bell size={26} />
  <div>Feed</div>
</button>
      
      </div>
    </div>
  );
}
