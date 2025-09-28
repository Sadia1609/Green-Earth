document.addEventListener('DOMContentLoaded', function () {
  const categoryContainer = document.getElementById('category-container');

  const plantContainer = document.getElementById('plant-container');

  const spinner = document.getElementById('spinner');

  const cartContainer = document.getElementById('cart');

  const totalPriceEl = document.getElementById('total-price');

  const detailModal = document.getElementById('detail-modal');

  const detailContent = document.getElementById('detail-content');

  const closeModalBtn = document.getElementById('close-modal');

  let cart = [];


  
  function showSpinner() {
    spinner.classList.remove('hidden');
    plantContainer.classList.add('hidden');
  }

  function hideSpinner() {
    spinner.classList.add('hidden');
    plantContainer.classList.remove('hidden');
  }

 
  
  function findArrayInResponse(resp) {
    if (!resp) 
      return [];
    if (Array.isArray(resp)) 
      return resp;
    const tryNames = ['data', 'categories', 'plants', 'results', 'items'];
    for (let n of tryNames) {
      if (Array.isArray(resp[n])) 
        return resp[n];
    }
    return [];
  }

 
  
  loadCategories();
  loadAllPlants();

 
  
  function loadCategories() {
    fetch('https://openapi.programming-hero.com/api/categories')
      .then(res => res.json())
      .then(data => {
        const categories = findArrayInResponse(data);
        displayCategories(categories);
      });
  }

  function displayCategories(categories) {
    categoryContainer.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'btn btn-block justify-start text-left active mb-2';
    allBtn.innerText = 'All Plants';
    allBtn.addEventListener('click', () => {
      setActiveButton(allBtn);
      loadAllPlants();
    });

    categoryContainer.appendChild(allBtn);

    categories.forEach(cat => {
      const catId = cat.id || cat.category_id || cat.categoryId;
      const catName = cat.category || cat.name || cat.category_name || cat.title;

      const btn = document.createElement('button');
      btn.className = 'btn btn-block justify-start text-left mb-2';
      btn.textContent = catName;

      if (catId) btn.dataset.catId = catId;

      btn.addEventListener('click', () => {
        setActiveButton(btn);

        if (catId) loadPlantsByCategory(catId);

      });

      categoryContainer.appendChild(btn);
    });
  }

  function setActiveButton(btn) {
    categoryContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  
  
  function loadAllPlants() {
    showSpinner();
    plantContainer.innerHTML = '';
    fetch('https://openapi.programming-hero.com/api/plants')
      .then(res => res.json())
      .then(data => {
        const plants = findArrayInResponse(data).slice(0, 12);
        displayPlants(plants);
      })
      .finally(hideSpinner);
  }

 
  
  function loadPlantsByCategory(catId) {
    showSpinner();
    plantContainer.innerHTML = '';
    fetch(`https://openapi.programming-hero.com/api/category/${catId}`)
      .then(res => res.json())
      .then(data => {
        const plants = findArrayInResponse(data);
        displayPlants(plants);
      })
      .finally(hideSpinner);
  }

  
  
  function displayPlants(plants) {
    plantContainer.innerHTML = '';

    
    plantContainer.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5';

    plants.forEach(plant => {
      const id = plant.plantId; 
      const name = plant.plantName || plant.name;
      const desc = plant.description || '';
      const category = plant.category;
      const image = plant.image || '';
      const price = Number(plant.price || 0);

      const card = document.createElement('div');
      card.className = 'p-4 bg-white rounded-lg shadow flex flex-col justify-between';

      card.innerHTML = `
        <img src="${image}" alt="${name}" class="card-img w-full h-48 object-cover rounded">
        <h3 class="mt-2 font-bold plant-title cursor-pointer text-lg" data-id="${id}">${name}</h3>
        <p class="text-sm text-gray-500">${desc.slice(0, 90)}${desc.length > 90 ? '...' : ''}</p>
        <div class="mt-2 flex items-center justify-between">
          <span class="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">${category}</span>
          <span class="font-semibold text-black">৳${price}</span>
        </div>
        <div class="mt-3">
          <button class="bg-green-900 text-white add-to-cart btn btn-sm btn-success w-full rounded-full"
            data-id="${id}" data-name="${name}" data-price="${price}">
            Add to Cart
          </button>
        </div>
      `;

      
      card.querySelector('.plant-title').addEventListener('click', function() {
        showPlantDetail({
          plantName: name,
          description: desc,
          image: image,
          category: category,
          price: price
        });
      });

     
      card.querySelector('.add-to-cart').addEventListener('click', () => {
        addToCart(id, name, price);
      });

      plantContainer.appendChild(card);
    });
  }

  function showPlantDetail(plant) {
    const name = plant.plantName;
    let desc = plant.description;

    if (desc.length > 90) 
      desc = desc.slice(0, 90) + '...';
    const category = plant.category;
    const image = plant.image;
    const price = plant.price;

    detailContent.innerHTML = `
      <div class="p-4 bg-white rounded-lg shadow flex flex-col">
        <img src="${image}" alt="${name}" class="w-full h-48 object-cover rounded mb-3">
        <h2 class="text-xl font-bold mb-2">${name}</h2>
        <p class="text-gray-700 mb-2">${desc}</p>
        <p class="text-sm text-green-600 mb-2">Category: ${category}</p>
        <p class="text-lg font-semibold">Price: ৳${price}</p>
      </div>
    `;

    detailModal.classList.add('modal-open');
  }

 
  closeModalBtn.addEventListener('click', function() {
    detailModal.classList.remove('modal-open');
  });

  function addToCart(id, name, price) {
    const item = cart.find(i => i.id === id);
    if (item) item.quantity++;
    else cart.push({ id, name, price, quantity: 1 });
    renderCart();
  }

  function removeFromCartById(id) {
    cart = cart.filter(i => i.id !== id);
    renderCart();
  }

  function renderCart() {
    cartContainer.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.quantity;
      const row = document.createElement('div');
      row.className = 'p-2 bg-[#f0fdf4] rounded flex items-center justify-between';
      row.innerHTML = `
        <div>
          <div class="font-semibold text-sm">${item.name}</div>
          <div class="text-xs text-gray-600">${item.quantity} x ৳${item.price}</div>
        </div>
        <button class="text-red-600 remove-btn" data-id="${item.id}">✕</button>
      `;
      row.querySelector('.remove-btn').addEventListener('click', () => removeFromCartById(item.id));
      cartContainer.appendChild(row);
    });

    totalPriceEl.innerText = total;
  }


});
