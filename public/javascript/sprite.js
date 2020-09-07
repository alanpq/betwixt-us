const sprites = {};

const getSprite = (spriteName) => {
  if (sprites[spriteName])
    return new Promise(resolve => {
      resolve(sprites[spriteName]);
    })
  else {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        sprites[spriteName] = img;
        console.log(`Loaded sprite '${spriteName}'!`);
        resolve(img);
      }
      img.onerror = (e) => {
        console.error(`Could not load sprite '${spriteName}'!\n${e}`);
        reject(e);
      }
      img.src = `../images/${spriteName}.png`;
    });
  }
}