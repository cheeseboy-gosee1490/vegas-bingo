import { bingoItems } from './data';

export default function App() {
  return (
    <div style={{padding:'20px'}}>
      <h1>Vegas Bingo 🎰</h1>
      <ul>
        {bingoItems.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  )
}
