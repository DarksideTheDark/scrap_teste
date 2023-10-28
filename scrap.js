// fazendo scrap e salvando em arquivo

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const app = express();
const port = 3000;

const endpoints = [
  '/phones/touch',
  '/computers/tablets',
  '/computers/laptops'
];

const base_url = 'https://webscraper.io/test-sites/e-commerce/static';

async function extractProductsFromPage(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const products = [];

    $('div.thumbnail').each((index, element) => {
      const title = $(element).find('a.title').text();
      const price = $(element).find('h4.price').text();
      const description = $(element).find('p.description').text();
      products.push({ title, price, description });
    });

    return products;
  } catch (error) {
    console.error(`Erro ao acessar a página: ${url}`);
    return [];
  }
}

async function extractProductsFromEndpoint(endpoint) {
  const allProducts = [];

  for (let page = 1; ; page++) {
    const pageUrl = `${base_url}${endpoint}?page=${page}`;
    const products = await extractProductsFromPage(pageUrl);

    if (products.length === 0) {
      break; // Páginas adicionais não contêm produtos
    }

    allProducts.push(...products);
  }

  return allProducts;
}

app.get('/extrair_produtos', async (req, res) => {
  const allProducts = [];

  for (const endpoint of endpoints) {
    const products = await extractProductsFromEndpoint(endpoint);
    allProducts.push({ endpoint, products });
  }

  // Escrever os produtos em um arquivo JSON
  fs.writeFileSync('products.json', JSON.stringify(allProducts));

  res.json({ message: 'Produtos extraídos e salvos em products.json' });

});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});