import React from 'react';
import AudioBookCarousel_A from './BookCarusels/AudioBookCarousel_A';
import BookCarousel_A from './BookCarusels/BookCarousel_A';
import AudioBookCarousel_B from './BookCarusels/AudioBookCarousel_B';

const Main = () => {
  const sections = [
    {
      title: "Читай, слушай книгу <br/>абсолютно бесплатно",
      isMainTitle: true,
      component: null
    },
    {
      component: <AudioBookCarousel_A />
    },
    {
      component: <BookCarousel_A title="Популярные книги" />
    },
    {
      title: "Интересное для вас: аудио",
      component: <AudioBookCarousel_B />
    },
    {
      component: <BookCarousel_A title="Новинки" offset={0} />
    },
    {
      component: <BookCarousel_A title="Новинки" offset={12} showTitle={false} /> // Скрываем заголовок
    },
    {
      isBanner: true,
      component: <div className="banner"></div>
    },
    {
      component: <BookCarousel_A title="Фантастика" />
    },
    {
      component: <BookCarousel_A title="Саморазвитие" />
    },
    {
      component: <BookCarousel_A title="Комиксы" />
    }
  ];

  return (
    <main>
      {sections.map((section, index) => (
        <React.Fragment key={index}>
          {section.isMainTitle ? (
            <div className="div-h1-main-page">
              <h1 
                className="h1-main-page" 
                dangerouslySetInnerHTML={{ __html: section.title }} 
              />
            </div>
          ) : section.isBanner ? (
            section.component
          ) : (
            <div className="div-category">
              <div className="div-h1-bestsellers">
                <h1 className="h1-bestsellers">{section.title}</h1>
              </div>
              {section.component}
            </div>
          )}
        </React.Fragment>
      ))}
    </main>
  );
};

export default Main;