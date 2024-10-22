// Global array to hold saved recipes
let myRecipes = [];

// Function to create recipe cards
function createRecipeCard(meal, isSearchResult) {
  const card = document.createElement("div");
  card.classList.add("bg-white", "rounded-lg", "shadow-md", "p-4");

  const image = document.createElement("img");
  image.src = meal.strMealThumb;
  image.alt = meal.strMeal;
  image.classList.add("w-full", "h-48", "object-cover");

  const title = document.createElement("h3");
  title.textContent = meal.strMeal;
  title.classList.add("text-lg", "font-semibold", "mt-2");

  const instructions = document.createElement("p");
  instructions.textContent =
    meal.strInstructions || "Instructions not available.";
  instructions.classList.add("mt-2", "text-gray-700");

  const button = document.createElement("button");
  button.textContent = isSearchResult ? "Save" : "Remove";
  button.classList.add(
    "py-2",
    "px-4",
    isSearchResult ? "bg-green-500" : "bg-red-500",
    "text-white",
    "rounded-lg",
    "mt-2"
  );

  button.addEventListener("click", () => {
    if (isSearchResult) saveRecipe(meal, card);
    else removeRecipe(meal, card);
  });

  card.append(image, title, instructions, button);
  return card;
}

// Function to save recipe
function saveRecipe(meal, recipeCard) {
  if (!myRecipes.some((m) => m.idMeal === meal.idMeal)) {
    myRecipes.push(meal);
    const savedCard = createRecipeCard(meal, false);
    document.getElementById("recipeList").appendChild(savedCard);
    recipeCard.remove(); // Remove the search result card
  } else {
    alert("This recipe is already saved!");
  }
}

// Function to remove recipe
function removeRecipe(meal, recipeCard) {
  myRecipes = myRecipes.filter((m) => m.idMeal !== meal.idMeal);
  recipeCard.remove(); // Remove the saved recipe card from the UI
}

// Fetch trending recipes
function fetchTrendingRecipes() {
  fetch("https://www.themealdb.com/api/json/v1/1/search.php?f=a")
    .then((response) => response.json())
    .then((data) => {
      const trendingContainer = document.getElementById("trendingRecipes");
      trendingContainer.innerHTML = ""; // Clear previous recipes
      data.meals.forEach((meal) => {
        const card = createRecipeCard(meal, false);
        trendingContainer.appendChild(card);
      });
    })
    .catch((error) => console.error("Error fetching trending recipes:", error));
}

// Event listener for search button
document.getElementById("submit").addEventListener("click", () => {
  const query = document.getElementById("search").value.trim();
  if (query) {
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
      .then((response) => response.json())
      .then((data) => {
        const searchResults = document.getElementById("searchResults");
        searchResults.innerHTML = ""; // Clear previous results

        if (data.meals) {
          data.meals.forEach((meal) => {
            const card = createRecipeCard(meal, true);
            searchResults.appendChild(card); // Display in search results
          });
        } else {
          searchResults.innerHTML = "<p>No results found.</p>";
        }
      })
      .catch((error) => console.error("Error fetching search results:", error));
  } else {
    alert("Please enter a meal name to search.");
  }
});

// Function to post a new recipe to db.json
function postRecipeToDb(recipe) {
  fetch("https://the-recepies.onrender.com/recipes", {
    // Adjust the URL if your mock server is hosted elsewhere
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recipe),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Recipe saved to db.json:", data);
    })
    .catch((error) => console.error("Error posting recipe to db.json:", error));
}

// Event listener for form submission
document.getElementById("addRecipeForm").addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent page reload
  const title = document.getElementById("recipeTitle").value;
  const image = document.getElementById("recipeImage").value;
  const instructions = document.getElementById("recipeInstructions").value;

  const newRecipe = {
    strMeal: title,
    strMealThumb: image,
    strInstructions: instructions,
    idMeal: new Date().getTime(),
  };

  myRecipes.push(newRecipe);
  const savedCard = createRecipeCard(newRecipe, false);
  document.getElementById("recipeList").appendChild(savedCard);

  // Post the new recipe to db.json
  postRecipeToDb(newRecipe);

  // Reset the form fields
  document.getElementById("addRecipeForm").reset();
});

// Initial fetch for trending recipes
fetchTrendingRecipes();
