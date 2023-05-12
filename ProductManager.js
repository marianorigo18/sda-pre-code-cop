const fs = require("fs");

class ProductManager {
  constructor(path) {
    if (!path || path === "") {
      throw new Error(
        'Debe ingresar una ruta válida para leer el archivo "products.txt"'
      );
    }
    if (!fs.existsSync(path)) {
      throw new Error(`No existe el archivo en el path: ${path}`);
    }
    // si no entramos en ninguno de los if, asigno el path
    this.path = path;
  }

  async addProduct(product) {
    // vamos a verificar que newProduct tenga todos los atributos que tiene que tener
    const { title, description, price, thumbnail, code, stock } = product;
    if (!title || !description || !price || !thumbnail || !code || !stock) {
      console.log("El producto debe tener todos los campos requeridos.");
      return;
    }
    // levanto el arreglo de productos que tengo en el archivo
    const products = await this.getProducts();
    // id para el nuevo producto si es que no hay productos en el archivo
    let newProductId = 1;
    // si hay productos, vamos a tener que cambiar el valor asignado a newProductId
    if (products.length > 0) {
      // en caso de querer actualizar el code de un producto, verificamos que no exista un producto con el mismo code
      const idx = products.findIndex((p) => p.code === code);
      if (idx !== -1) {
        console.log(
          `Existe un producto con code: ${code}. No se agrega el producto.`
        );
        return;
      }
      // no hubo problemas con el code, entonces asignamos un nuevo valor a newProductId
      newProductId = products[products.length - 1].id + 1;
    }
    // creamos el nuevo producto
    const newProduct = { id: newProductId, ...product };
    // ponemos el nuevo producto en el arreglo products
    products.push(newProduct);
    // guardamos el listado de productos en el archivo
    await fs.promises.writeFile(this.path, JSON.stringify(products), "utf-8");
    // si se agrego el nuevo producto, logueamos por consola
    console.log(`Nuevo producto agregado con id: ${newProductId}`);
  }

  async getProducts() {
    // leo el archivo con la sintaxis fs.promises
    const fileContent = await fs.promises.readFile(this.path, "utf-8");
    let products = [];
    // si el archivo no esta vacío, parseo el contenido
    if (fileContent) {
      // parseo el contenido del archivo
      products = JSON.parse(fileContent);
    }
    // retorno el arreglo de productos
    // si el archivo no tiene nada, se devuelve un arreglo vacío
    return products;
  }

  async getProductById(id) {
    const products = await this.getProducts();
    let product;
    // si existen productos, buscamos por id
    if (products.length > 0) {
      product = products.find((p) => p.id === id);
    }
    if (!product) console.log(`No existe un producto con id: ${id}`);
    // si existe el producto buscado, lo devuelvo
    // si no existe el producto buscado, devuelvo undefined
    return product;
  }

  /* 
    productUpdate actulizar todos los campos de un producto o solo algunos
        1) {price: 1500} solo queremos actulizar el precio de un producto
        2) {title: 'nuevo title', description: 'new description, ...} quiero actulizar todos los campos
  */
  async updateProduct(id, productUpdate) {
    // traemos los productos que están en el archivo
    const products = await this.getProducts();
    // si hay productos, entramos al bloque if
    if (products.length > 0) {
      const productIdx = products.findIndex((p) => p.id === id);
      // si no existe el producto, muestro un msj por consola y salgo del método sin hacer la actualización
      if (productIdx === -1) {
        console.log(
          `No existe un producto con id: ${id}. No se realiza ninguna actualización.`
        );
        return;
      }
      // si en la actulización, queremos cambiar el code del producto, debemos validar que no haya otro producto que ya tenga ese code
      if (products[productIdx].code === productUpdate.code) {
        console.log(
          `Existe un producto con code: ${productUpdate.code}. No se actualiza el producto.`
        );
        return;
      }
      // el producto buscado existe, no hay problemas con el code, entonces lo actualizo
      products[productIdx] = { ...products[productIdx], ...productUpdate };
      await fs.promises.writeFile(this.path, JSON.stringify(products), "utf-8");
      // si se actualizo, logueamos por consola
      console.log(`Producto con id: ${productIdx} actualizado.`);
    } else {
      // no hay productos
      console.log("No hay productos. No se puede realizar la actualización.");
    }
  }

  async deleteProduct(id) {
    // uso mi función getProducts para leer el archivo y obtener los productos
    const products = await this.getProducts();
    let filteredProducts = [];
    if (products.length > 0) {
      // filtro los productos. Me quedo con lo que tengan id DISTINTO al id que quiero sacar
      filteredProducts = products.filter((p) => p.id !== id);
    }
    // si se verifica la condición significa que se saco un producto de arreglo products y entonces tengo que actulizar el archivo
    // si no se cumple la condición, no tengo que eliminar ningún producto
    if (filteredProducts.length === products.length - 1) {
      // guardo los productos filtrado en el archivo
      await fs.promises.writeFile(
        this.path,
        JSON.stringify(filteredProducts),
        "utf-8"
      );
      console.log(`El producto con id: ${id} fue eliminado.`);
    } else {
      console.log(`No existe producto con id: ${id}.`);
    }
  }
}

module.exports = {
  ProductManager,
};
