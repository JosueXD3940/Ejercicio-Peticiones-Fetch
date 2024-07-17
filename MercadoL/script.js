document.getElementById('searchBtn').addEventListener('click', function() {
    const query = document.getElementById('searchQuery').value;
    fetchProducts(query);
});

function fetchProducts(query) {
    fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${query}`)
        .then(response => response.json())
        .then(data => {
            const products = data.results;
            const productList = document.getElementById('productList');
            

            productList.innerHTML = '';
            products.forEach(product => {
                const imageUrl = product.thumbnail.replace('I.jpg', 'B.jpg');
                const productCard = `
                    <div class="col-md-4">
                        <div class="card">
                            <img src="${imageUrl}" class="card-img-top" alt="${product.title}">
                            <div class="card-body">
                                <h5 class="card-title">${product.title}</h5>
                                <p class="card-text">$${product.price}</p>
                                <a href="${product.permalink}" target="_blank" class="btn btn-primary">Ver producto</a>
                            </div>
                        </div>
                    </div>
                `;
                productList.insertAdjacentHTML('beforeend', productCard);
            });
        })
        .catch(error => console.error('Error fetching products:', error));
}
