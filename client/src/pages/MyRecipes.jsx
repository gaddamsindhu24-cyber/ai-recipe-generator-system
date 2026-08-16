import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://ai-recipe-generator-465f.onrender.com";

function MyRecipes() {
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedDiet, setSelectedDiet] = useState("");
  const [message, setMessage] = useState("");

  const [viewRecipe, setViewRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);

  // =========================
  // FETCH RECIPES
  // =========================
  const fetchRecipes = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/app");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/recipes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load recipes");
        return;
      }

      setRecipes(data.recipes || []);
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to server");
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  // =========================
  // VIEW RECIPE
  // =========================
  const handleView = (recipe) => {
    setViewRecipe(recipe);
    setEditingRecipe(null);
    setMessage("");

    setTimeout(() => {
      document
        .getElementById("view-recipe-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  // =========================
  // START EDIT
  // =========================
  const startEdit = (recipe) => {
    setEditingRecipe({ ...recipe });
    setViewRecipe(null);
    setMessage("");

    setTimeout(() => {
      document
        .getElementById("edit-recipe-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  // =========================
  // DELETE RECIPE
  // =========================
  const deleteRecipe = async (recipeId) => {
    const token = localStorage.getItem("token");

    const confirmed = window.confirm(
      "Are you sure you want to delete this recipe?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/recipes/${recipeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to delete recipe"
        );
        return;
      }

      // Remove recipe from screen immediately
      setRecipes((previousRecipes) =>
        previousRecipes.filter(
          (recipe) => recipe._id !== recipeId
        )
      );

      // Close view/edit if that recipe was open
      if (viewRecipe?._id === recipeId) {
        setViewRecipe(null);
      }

      if (editingRecipe?._id === recipeId) {
        setEditingRecipe(null);
      }

      setMessage("Recipe deleted successfully ✅");

    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to server");
    }
  };

  // =========================
  // UPDATE RECIPE
  // =========================
  const updateRecipe = async () => {
    if (!editingRecipe) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/api/recipes/${editingRecipe._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editingRecipe.title,
            cuisine: editingRecipe.cuisine,
            mealType: editingRecipe.mealType,
            dietaryPreference:
              editingRecipe.dietaryPreference,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to update recipe"
        );
        return;
      }

      // Update recipe in list
      setRecipes((previousRecipes) =>
        previousRecipes.map((recipe) =>
          recipe._id === editingRecipe._id
            ? data.recipe || editingRecipe
            : recipe
        )
      );

      setEditingRecipe(null);

      setMessage(
        "Recipe updated successfully 🎉"
      );

    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to server");
    }
  };

  // =========================
  // SEARCH + FILTER
  // =========================
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCuisine =
      selectedCuisine === "" ||
      recipe.cuisine === selectedCuisine;

    const matchesDiet =
      selectedDiet === "" ||
      recipe.dietaryPreference === selectedDiet;

    return (
      matchesSearch &&
      matchesCuisine &&
      matchesDiet
    );
  });

  // =========================
  // STATISTICS
  // =========================
  const cuisines = [
    ...new Set(
      recipes
        .map((recipe) => recipe.cuisine)
        .filter(Boolean)
    ),
  ];

  const diets = [
    ...new Set(
      recipes
        .map(
          (recipe) =>
            recipe.dietaryPreference
        )
        .filter(Boolean)
    ),
  ];

  return (
    <div
      className="min-vh-100"
      style={{
        backgroundColor: "#f8f1ff",
        padding: "40px 20px 80px",
      }}
    >
      <div className="container">

        {/* =========================
            HEADER
        ========================= */}
        <div
          className="d-flex justify-content-between align-items-center mb-4"
        >
          <h1
            className="fw-bold mb-0"
            style={{ color: "#0c4c2a" }}
          >
            🍳 My Recipes
          </h1>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/app")}
          >
            ✨ Generate Recipe
          </button>
        </div>

        {/* =========================
            MESSAGE
        ========================= */}
        {message && (
          <div
            className="alert alert-info text-center"
            role="alert"
          >
            {message}
          </div>
        )}

        {/* =========================
            STATISTICS
        ========================= */}
        <div className="row g-3 mb-4">

          <div className="col-md-4">
            <div
              className="card shadow-sm text-center p-4 h-100"
              style={{
                backgroundColor: "#f3eafa",
                borderRadius: "18px",
                border: "1px solid #d8c4f0",
              }}
            >
              <h5 className="fw-bold">
                Total Recipes
              </h5>

              <h2
                className="fw-bold mt-2"
                style={{ color: "#6f42c1" }}
              >
                {recipes.length}
              </h2>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className="card shadow-sm text-center p-4 h-100"
              style={{
                backgroundColor: "#f3eafa",
                borderRadius: "18px",
                border: "1px solid #d8c4f0",
              }}
            >
              <h5 className="fw-bold">
                Total Cuisines
              </h5>

              <h2
                className="fw-bold mt-2"
                style={{ color: "#6f42c1" }}
              >
                {cuisines.length}
              </h2>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className="card shadow-sm text-center p-4 h-100"
              style={{
                backgroundColor: "#f3eafa",
                borderRadius: "18px",
                border: "1px solid #d8c4f0",
              }}
            >
              <h5 className="fw-bold">
                Total Dietary Types
              </h5>

              <h2
                className="fw-bold mt-2"
                style={{ color: "#6f42c1" }}
              >
                {diets.length}
              </h2>
            </div>
          </div>

        </div>

        {/* =========================
            SEARCH + FILTER
        ========================= */}
        <div
          className="card shadow-sm p-4 mb-4"
          style={{
            borderRadius: "20px",
            backgroundColor: "#ffffff",
            border: "1px solid #ddd",
          }}
        >
          <h4 className="fw-bold text-center mb-4">
            🔍 Search Recipes
          </h4>

          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

          <div className="row g-3">

            {/* CUISINE */}
            <div className="col-md-6">
              <select
                className="form-select"
                value={selectedCuisine}
                onChange={(e) =>
                  setSelectedCuisine(
                    e.target.value
                  )
                }
              >
                <option value="">
                  All Cuisines
                </option>

                <option value="Indian">
                  🍛 Indian
                </option>

                <option value="Italian">
                  🍝 Italian
                </option>

                <option value="Chinese">
                  🍜 Chinese
                </option>

                <option value="Mexican">
                  🌮 Mexican
                </option>

                <option value="American">
                  🍔 American
                </option>
              </select>
            </div>

            {/* DIET */}
            <div className="col-md-6">
              <select
                className="form-select"
                value={selectedDiet}
                onChange={(e) =>
                  setSelectedDiet(
                    e.target.value
                  )
                }
              >
                <option value="">
                  All Dietary Preferences
                </option>

                <option value="Vegetarian">
                  🥦 Vegetarian
                </option>

                <option value="Non-Vegetarian">
                  🍗 Non-Vegetarian
                </option>

                <option value="Vegan">
                  🌱 Vegan
                </option>

                <option value="None">
                  🥣 None
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* =========================
            RECIPE LIST
        ========================= */}
        {filteredRecipes.length === 0 ? (

          <div
            className="text-center p-5"
            style={{
              backgroundColor: "#f3eafa",
              borderRadius: "20px",
            }}
          >
            <h4 className="fw-bold">
              No recipes found
            </h4>

            <p>
              Generate a recipe to see it here.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate("/app")
              }
            >
              ✨ Generate Recipe
            </button>
          </div>

        ) : (

          <div className="row g-4">

            {filteredRecipes.map((recipe) => (

              <div
                className="col-md-6"
                key={recipe._id}
              >

                <div
                  className="card shadow-sm h-100 p-4"
                  style={{
                    borderRadius: "20px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #ddd",
                  }}
                >

                  {/* TITLE */}
                  <h3
                    className="fw-bold text-center mb-3"
                    style={{
                      color: "#063098",
                    }}
                  >
                    {recipe.title}
                  </h3>

                  <p>
                    <strong>
                      Cuisine:
                    </strong>{" "}
                    {recipe.cuisine}
                  </p>

                  <p>
                    <strong>
                      Meal:
                    </strong>{" "}
                    {recipe.mealType}
                  </p>

                  <p>
                    <strong>
                      Preparation Time:
                    </strong>{" "}
                    {recipe.preparationTime}
                  </p>

                  <p>
                    <strong>
                      Cooking Time:
                    </strong>{" "}
                    {recipe.cookingTime}
                  </p>

                  <p>
                    <strong>
                      Servings:
                    </strong>{" "}
                    {recipe.servings}
                  </p>

                  {/* BUTTONS */}
                  <div className="mt-auto pt-3">

                    <button
                      type="button"
                      className="btn btn-primary me-2 mb-2"
                      onClick={() =>
                        handleView(recipe)
                      }
                    >
                      👁️ View
                    </button>

                    <button
                      type="button"
                      className="btn btn-warning me-2 mb-2"
                      onClick={() =>
                        startEdit(recipe)
                      }
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger mb-2"
                      onClick={() =>
                        deleteRecipe(
                          recipe._id
                        )
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

        {/* =================================================
            VIEW RECIPE
        ================================================= */}
        {viewRecipe && (

          <div
            id="view-recipe-section"
            className="card shadow-lg mt-5 p-4"
            style={{
              borderRadius: "20px",
              backgroundColor: "#ffffff",
              border: "1px solid #d8c4f0",
            }}
          >

            <div
              className="d-flex justify-content-between align-items-center mb-3"
            >

              <h2
                className="fw-bold mb-0"
                style={{
                  color: "#063098",
                }}
              >
                👁️ Recipe Details
              </h2>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setViewRecipe(null)
                }
              >
                ✖ Close
              </button>

            </div>

            <hr />

            <h2
              className="text-center fw-bold mb-4"
              style={{
                color: "#063098",
              }}
            >
              {viewRecipe.title}
            </h2>

            <div className="row">

              <div className="col-md-6">

                <p>
                  <strong>
                    Cuisine:
                  </strong>{" "}
                  {viewRecipe.cuisine}
                </p>

                <p>
                  <strong>
                    Meal:
                  </strong>{" "}
                  {viewRecipe.mealType}
                </p>

                <p>
                  <strong>
                    Preparation Time:
                  </strong>{" "}
                  {viewRecipe.preparationTime}
                </p>

              </div>

              <div className="col-md-6">

                <p>
                  <strong>
                    Cooking Time:
                  </strong>{" "}
                  {viewRecipe.cookingTime}
                </p>

                <p>
                  <strong>
                    Servings:
                  </strong>{" "}
                  {viewRecipe.servings}
                </p>

                <p>
                  <strong>
                    Dietary Preference:
                  </strong>{" "}
                  {viewRecipe.dietaryPreference ||
                    "None"}
                </p>

              </div>

            </div>

            {/* INGREDIENTS */}
            <h4
              className="fw-bold mt-4"
              style={{ color: "#6f42c1" }}
            >
              🥕 Ingredients
            </h4>

            <ul>
              {viewRecipe.ingredients?.map(
                (item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                )
              )}
            </ul>

            {/* INSTRUCTIONS */}
            <h4
              className="fw-bold mt-4"
              style={{ color: "#6f42c1" }}
            >
              👩‍🍳 Instructions
            </h4>

            <ol>
              {viewRecipe.instructions?.map(
                (step, index) => (
                  <li
                    key={index}
                    className="mb-2"
                  >
                    {step}
                  </li>
                )
              )}
            </ol>

            {/* NUTRITION */}
            {viewRecipe.nutrition && (

              <>
                <h4
                  className="fw-bold mt-4"
                  style={{
                    color: "#6f42c1",
                  }}
                >
                  🥗 Nutrition
                </h4>

                <p>
                  <strong>
                    Calories:
                  </strong>{" "}
                  {viewRecipe.nutrition.calories}
                </p>

                <p>
                  <strong>
                    Protein:
                  </strong>{" "}
                  {viewRecipe.nutrition.protein}
                </p>

                <p>
                  <strong>
                    Carbohydrates:
                  </strong>{" "}
                  {viewRecipe.nutrition.carbohydrates}
                </p>

                <p>
                  <strong>
                    Fat:
                  </strong>{" "}
                  {viewRecipe.nutrition.fat}
                </p>
              </>

            )}

            {/* TIPS */}
            {viewRecipe.tips && (

              <>
                <h4
                  className="fw-bold mt-4"
                  style={{
                    color: "#6f42c1",
                  }}
                >
                  💡 Cooking Tips
                </h4>

                <ul>
                  {viewRecipe.tips.map(
                    (tip, index) => (
                      <li key={index}>
                        {tip}
                      </li>
                    )
                  )}
                </ul>
              </>

            )}

            <div className="text-center mt-4">

              <button
                type="button"
                className="btn btn-warning me-2"
                onClick={() =>
                  startEdit(viewRecipe)
                }
              >
                ✏️ Edit Recipe
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={() =>
                  deleteRecipe(
                    viewRecipe._id
                  )
                }
              >
                🗑️ Delete Recipe
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            EDIT RECIPE
        ================================================= */}
        {editingRecipe && (

          <div
            id="edit-recipe-section"
            className="card shadow-lg mt-5 p-4"
            style={{
              borderRadius: "20px",
              backgroundColor: "#fff0f6",
              border: "1px solid #f3c1d5",
            }}
          >

            <h2
              className="text-white fw-bold text-center rounded p-3 mb-4"
              style={{
                backgroundColor: "#e83e8c",
              }}
            >
              ✏️ Edit Recipe
            </h2>

            {/* TITLE */}
            <label className="form-label fw-bold">
              Recipe Title
            </label>

            <input
              type="text"
              className="form-control mb-3"
              value={
                editingRecipe.title || ""
              }
              onChange={(e) =>
                setEditingRecipe({
                  ...editingRecipe,
                  title: e.target.value,
                })
              }
            />

            {/* CUISINE */}
            <label className="form-label fw-bold">
              Cuisine
            </label>

            <select
              className="form-select mb-3"
              value={
                editingRecipe.cuisine || ""
              }
              onChange={(e) =>
                setEditingRecipe({
                  ...editingRecipe,
                  cuisine: e.target.value,
                })
              }
            >
              <option value="Indian">
                🍛 Indian
              </option>

              <option value="Italian">
                🍝 Italian
              </option>

              <option value="Chinese">
                🍜 Chinese
              </option>

              <option value="Mexican">
                🌮 Mexican
              </option>

              <option value="American">
                🍔 American
              </option>
            </select>

            {/* MEAL TYPE */}
            <label className="form-label fw-bold">
              Meal Type
            </label>

            <input
              type="text"
              className="form-control mb-3"
              value={
                editingRecipe.mealType || ""
              }
              onChange={(e) =>
                setEditingRecipe({
                  ...editingRecipe,
                  mealType: e.target.value,
                })
              }
            />

            {/* DIET */}
            <label className="form-label fw-bold">
              Dietary Preference
            </label>

            <select
              className="form-select mb-4"
              value={
                editingRecipe.dietaryPreference ||
                "None"
              }
              onChange={(e) =>
                setEditingRecipe({
                  ...editingRecipe,
                  dietaryPreference:
                    e.target.value,
                })
              }
            >
              <option value="Vegetarian">
                🥦 Vegetarian
              </option>

              <option value="Non-Vegetarian">
                🍗 Non-Vegetarian
              </option>

              <option value="Vegan">
                🌱 Vegan
              </option>

              <option value="None">
                🥣 None
              </option>
            </select>

            {/* SAVE / CANCEL */}
            <div className="text-center">

              <button
                type="button"
                className="btn btn-success me-2"
                onClick={updateRecipe}
              >
                💾 Save Changes
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setEditingRecipe(null)
                }
              >
                ✖ Cancel
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default MyRecipes;