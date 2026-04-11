import './LoadingScreen.css';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loader">
        <div className="book">
          <div className="page"></div>
          <div className="page"></div>
          <div className="page"></div>
        </div>
        <h2>Загружаем вашу библиотеку...</h2>
      </div>
    </div>
  );
}