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
    spinner?.classList.remove('hidden');
    plantContainer?.classList.add('hidden');
  }

  function hideSpinner() {
    spinner?.classList.add('hidden');
    plantContainer?.classList.remove('hidden');
  }

  function findArrayInResponse(resp) {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;

    const tryNames = ['data', 'categories', 'plants', 'results', 'items'];
    for (let n of tryNames) {
      if (Array.isArray(resp[n])) return resp[n];
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
      })
    
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
      const catName = cat.name || cat.category_name || cat.category || cat.title;

      const btn = document.createElement('button');
      btn.className = 'btn btn-block justify-start text-left mb-2';
      btn.textContent = catName;
      if (catId) btn.dataset.catId = catId;

      btn.addEventListener('click', () => {
        setActiveButton(btn);
        if (catId) loadPlantsByCategory(catId);
        else loadAllPlants();
      });

      categoryContainer.appendChild(btn);
    });
  }

  function setActiveButton(btn) {
    categoryContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }


  function loadPlantsByCategory(catId) {
    showSpinner();
    plantContainer.innerHTML = '';
    fetch(`https://openapi.programming-hero.com/api/category/${encodeURIComponent(catId)}`)
      .then(res => res.json())
      .then(data => {
        const plants = findArrayInResponse(data);
        displayPlants(plants);
      })
      .finally(hideSpinner);
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

  function displayPlants(plants) {
    plantContainer.innerHTML = '';
    
    plantContainer.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5';

    plants.forEach(plant => {
      const id = plant.id || plant._id || plant.plant_id || plant.plantId;

      const name = plant.name || plant.plant_name || plant.title;
      const desc = plant.description || plant.details || plant.about || '';
      const category = plant.category || plant.category_name;
      const image = plant.image || plant.img || plant.picture || plant.plant_img;
      const price = Number(plant.price || plant.cost || plant.amount);

      const card = document.createElement('div');
      card.className = 'p-4 bg-white rounded-lg shadow flex flex-col justify-between';

      card.innerHTML = `
        <img src="${image}" alt="${name}" class="card-img w-full h-48 object-cover rounded">
        <h3 class="mt-2 font-bold plant-title cursor-pointer text-lg" data-id="${id}">${name}</h3>
        <p class="text-sm text-gray-600">${desc.slice(0, 90)}${desc.length > 90 ? '...' : ''}</p>
        <div class="mt-2 flex items-center justify-between">
          <span class="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">${category}</span>
          <span class="font-semibold text-black">৳${price}</span>
        </div>
        <div class="mt-3">
          <button class="bg-green-900 text-white add-to-cart btn btn-sm btn-success w-full rounded-full" data-id="${id}" data-name="${name}" data-price="${price}">Add to Cart</button>
        </div>
      `;


      plantContainer.appendChild(card);
    });
  }


  function loadPlantDetails(plantId) {
    detailContent.innerHTML = '<p>Loading...</p>';
    fetch(`https://openapi.programming-hero.com/api/plant/${id}`)
      .then(res => res.json())
      .then(data => {
        const plant = data.data || data.plant || data;
        
        const name = plant.name || plant.plant_name || plant.title;
        const image = plant.image || plant.img || plant.picture;
        const description = plant.details || plant.description || plant.about;
        const category = plant.category || plant.category_name || '';

        detailContent.innerHTML = `
          <img src="${image}" class="detail-img w-full h-auto object-cover rounded mb-3" alt="${name}">
          <h2 class="text-xl font-bold mb-2">${name}</h2>
          <p class="text-sm text-gray-700 mb-2">${description}</p>
          <p class="text-sm"><strong>Category:</strong> ${category}</p>
        `;

        if (detailModal.showModal) detailModal.showModal();
        else detailModal.style.display = 'block';
      })
    
  }

  closeModalBtn?.addEventListener('click', () => {
    if (detailModal.close) detailModal.close();
    else detailModal.style.display = 'none';
  });

});