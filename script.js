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


});