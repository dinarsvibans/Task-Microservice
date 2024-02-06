const express = require('express');

const app = express();
const axios = require('axios');
const cors = require('cors');
const { parseString } = require('xml2js');

app.use(cors());
app.use(express.json());

const logRequestResponse = async (req, res, next) => {
  try {
    const logMessageIn = {
      type: 'messageIn',
      body: req.query,
      method: req.method,
      path: req.originalUrl,
      dateTime: new Date().toISOString(),
    };

    console.log(JSON.stringify(logMessageIn));

    const originalJson = res.json;
    res.json = async (body) => {
      const resContext = res;
      const logMessageOut = {
        type: 'messageOut',
        body,
        dateTime: new Date().toISOString(),
        fault: resContext.statusCode >= 400 ? 'Error occurred' : null,
      };
      console.log(JSON.stringify(logMessageOut));
      await originalJson.call(resContext, body);
    };

    next();
  } catch (error) {
    console.error('Error logging request/response:', error);
    next(error);
  }
};

const calculateFinalPrice = (startingPrice, discountPercentage) => {
  const discountAmount = (startingPrice / 100) * discountPercentage;
  const price = startingPrice - discountAmount;
  return price.toFixed(2);
};

const validateInput = (req, res, next) => {
  const { q, limit, skip } = req.query;

  if (!q || !limit || !skip || Number.isNaN(Number(limit)) || Number.isNaN(Number(skip))
  || (Number(q) < 0 || Number(limit) < 0 || Number(skip) < 0)) {
    return res
      .status(400)
      .json({ code: 400, message: 'Bad Request: Invalid input parameters' });
  }

  return next();
};

const handleAPICallError = (error, req, res) => {
  console.error('Error calling third-party API:', error.message);
  res.status(500).json({ code: 500, message: 'Internal Server Error' });
};

const handleDataTransformationError = (error, req, res) => {
  console.error('Error parsing XML:', error.message);
  res.status(500).json({ code: 500, message: 'Internal Server Error' });
};
app.use(logRequestResponse);
app.get('/', validateInput, async (req, res) => {
  try {
    const { q, limit, skip } = req.query;

    const response = await axios.get(
      `https://dummyjson.com/products/search?q=${q}&limit=${limit}&skip=${skip}`,
      {
        headers: {
          Accept: 'application/xml',
        },
      },
    );

    const contentType = response.headers['content-type'];
    const { data } = response;

    if (contentType.includes('xml')) {
      parseString(response.data, (err) => {
        if (err) {
          throw new Error(err.message);
        }
      });
    }

    if (!Array.isArray(data.products)) {
      throw new Error("'products' property is not an array");
    }

    const productsWithFinalPrice = data.products.map((product) => ({
      ...product,
      finalPrice: calculateFinalPrice(
        product.price,
        product.discountPercentage,
      ),
    }));

    const updatedData = {
      ...data,
      products: productsWithFinalPrice,
    };

    if (contentType.includes('xml')) {
      const xmlResponse = new parseString.Builder().buildObject(updatedData);
      res.send(xmlResponse);
    } else {
      res.json(updatedData);
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ code: 500, message: 'Internal Server Error' });
  }
});

app.use(handleAPICallError);
app.use(handleDataTransformationError);

module.exports = app;
