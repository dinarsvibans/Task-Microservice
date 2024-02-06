import './App.css';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';


function App() {
  const [serverData, setServerData] = useState([]);
  const [query, setQuery] = useState('phone');
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState('2');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/?q=${query}&limit=${limit}&skip=${skip}`
        );

        setServerData(response.data);
      } catch (error) {
        console.log('Error:', error);
      }
    };

    fetchData();
  }, [query, skip, limit]);

  const nextPage = () => {
    setSkip((skip) => skip + 2);
  };

  const previousPage = () => {
    setSkip((skip) => skip - 2);
  };

  return (
    <div className="container">
      <div className="controls">
        <button onClick={previousPage} className="controls__button">
          Previous Page
        </button>
        <div className="controls__wrap">
          <label htmlFor="productSearch" className="controls__label">
            Search for products
          </label>
          <input
            type="text"
            id="productSearch"
            name="productSearch"
            placeholder="Product name"
            onChange={(e) => setQuery(e.target.value)}
            className="controls__input"
          />
        </div>
        <div className="controls__wrap">
          <label htmlFor="itemsShown" className="controls__label">
            Items Shown:
          </label>
          <input
            type="number"
            value={limit}
            id="itemsShown"
            name="itemsShown"
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="controls__input"
          />
        </div>
        <button onClick={nextPage} className="controls__button">
          Next Page
        </button>
      </div>
      <div className="cards-wrapper">
        {serverData.products &&
          serverData.products.map((product, index) => (
            <div className="card" key={index}>
              <div className="card-titleWrap">
                <h2 className="card__title">{product.title}</h2>
                <div className="card-priceWrap">
                  <span className="card-startingPrice">{product.price}/$</span>
                  <span className="card-finalPrice">
                    {product.finalPrice}/$
                  </span>
                </div>
              </div>
              <Carousel className="card__carousel">
                {product.images.map((image, imgIndex) => (
                  <div key={imgIndex}>
                    <img
                      className="card__image"
                      src={image}
                      alt={`Product ${imgIndex + 1}`}
                    />
                  </div>
                ))}
              </Carousel>
              <p className="card__description">{product.description}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
