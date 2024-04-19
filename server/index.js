let {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  createFavorite,
  destroyFavorite,
} = require("./db");

let express = require("express");
let app = express();
app.use(express.json());

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (error) {
    next(error);
  }
});
app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (error) {
    next(error);
  }
});
app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (error) {
    next(error);
  }
});
app.post("/api/users", async (req, res, next) => {
  try {
    res.status(201).send(await createUser(req.body));
  } catch (error) {
    next(error);
  }
});
app.post("/api/products", async (req, res, next) => {
  try {
    res.status(201).send(await createProduct(req.body));
  } catch (error) {
    next(error);
  }
});
app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.status(201).send(
      await createFavorite({
        user_id: req.params.id,
        product_id: req.body.product_id,
      })
    );
  } catch (error) {
    next(error);
  }
});
app.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
  try {
    await destroyFavorite({ user_id: req.params.userId, id: req.params.id });
    res.sendStatus(204);
    // res.json({ message: "product removed from favorites" });
  } catch (error) {
    next(error);
  }
});

async function init() {
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");

  let [
    anna,
    janis,
    liva,
    elina,
    martins,
    teaCup,
    perfumeBottle,
    pearlNecklace,
    vinylRecord,
    cowboyBoots,
    silkDress,
    saladBowl,
    doorKnocker,
    moviePoster,
    knitCardigan,
    victoryPin,
  ] = await Promise.all([
    createUser({ username: "anna", password: "anna_pw" }),
    createUser({ username: "janis", password: "janis_pw" }),
    createUser({ username: "liva", password: "liva_pw" }),
    createUser({ username: "elina", password: "elina_pw" }),
    createUser({ username: "martins", password: "martins_pw" }),
    createProduct({ name: "rose patterned china tea cup" }),
    createProduct({ name: "Chanel No. 5 perfume bottle (empty)" }),
    createProduct({ name: "faux saltwater pearl necklace" }),
    createProduct({ name: "'Jeff Buckley - Grace' vinyl record" }),
    createProduct({ name: "Frye leather cowboy boots (cracked)" }),
    createProduct({ name: "Pucci printed silk dress" }),
    createProduct({ name: "royal stained glass salad bowl" }),
    createProduct({ name: "Victorian brass dragon head door knocker" }),
    createProduct({ name: "original 'Jumanji' movie poster" }),
    createProduct({ name: "Irish knit cardigan" }),
    createProduct({ name: "World War II victory pin" }),
  ]);

  console.log(await fetchUsers());
  console.log(await fetchProducts());

  let userFavorites = await Promise.all([
    createFavorite({ user_id: anna.id, product_id: saladBowl.id }),
    createFavorite({ user_id: anna.id, product_id: vinylRecord.id }),
    createFavorite({ user_id: anna.id, product_id: perfumeBottle.id }),
    createFavorite({ user_id: liva.id, product_id: cowboyBoots.id }),
    createFavorite({ user_id: janis.id, product_id: moviePoster.id }),
    createFavorite({ user_id: elina.id, product_id: silkDress.id }),
    createFavorite({ user_id: elina.id, product_id: victoryPin.id }),
    createFavorite({ user_id: martins.id, product_id: doorKnocker.id }),
    createFavorite({ user_id: martins.id, product_id: perfumeBottle.id }),
  ]);

  console.log(await fetchFavorites(anna.id));
  await destroyFavorite({ user_id: anna.id, id: userFavorites[0].id });
  console.log(await fetchFavorites(anna.id));

  console.log(
    `curl -X POST localhost:3000/api/users/${martins.id}/favorites -d '{"product_id": "${victoryPin.id}"}' -H 'Content-Type:application/json'`
  );
  console.log(
    `curl -X DELETE localhost:3000/api/users/${martins.id}/favorites/${userFavorites[7].id} `
  );

  console.log("data seeded");
  let port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
}

init();
