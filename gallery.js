/*
  Photos must still be numbered:

  1.jpg
  2.png
  3.jpeg
  4.webp

  Each photo can use a different format.
*/

const collections = [
  {
    gridId: "cataloguing-grid",
    folder: "portfolio-media/ai-cataloguing",
    count: 6,
    label: "AI cataloguing project"
  },
  {
    gridId: "mood-grid",
    folder: "portfolio-media/ai-mood-shots",
    count: 6,
    label: "AI mood shot"
  },
  {
    gridId: "art-grid",
    folder: "portfolio-media/art-direction",
    count: 11,
    label: "Art direction project"
  },
  {
    gridId: "event-grid",
    folder: "portfolio-media/event-design",
    count: 9,
    label: "Event design project"
  },
    {
  gridId: "caratlane-grid",
  folder: "portfolio-media/store-design/caratlane",
  count: 6,
  label: "Caratlane store design"
},
{
  gridId: "fastrack-grid",
  folder: "portfolio-media/store-design/fastrack",
  count: 3,
  label: "Fastrack store design"
},
{
  gridId: "runway-grid",
  folder: "portfolio-media/store-design/runway",
  count: 4,
  label: "Runway store design"
},
{
  gridId: "titan-grid",
  folder: "portfolio-media/store-design/titan-eye-plus-4",
  count: 4,
  label: "Titan Eye+4 store design"
},
  {
    gridId: "packaging-grid",
    folder: "portfolio-media/packaging",
    count: 3,
    label: "Packaging design project"
  },
  {
    gridId: "social-grid",
    folder: "portfolio-media/social-media",
    count: 8,
    label: "Social media content project"
  }
];

// The gallery tries these formats in this order.
const imageFormats = ["jpg", "jpeg", "png", "webp"];

collections.forEach((collection) => {
  const grid = document.getElementById(collection.gridId);

  if (!grid) return;

  for (let number = 1; number <= collection.count; number++) {
    const figure = document.createElement("figure");
    figure.className = "gallery-item";

    const image = document.createElement("img");
    image.alt = `${collection.label} ${number} by Chekku Designs`;
    image.loading = "lazy";

    let formatIndex = 0;

    function tryNextFormat() {
      if (formatIndex >= imageFormats.length) {
        figure.classList.add("gallery-item-error");
        figure.textContent =
          `Photo ${number} not found in ${collection.folder}. ` +
          `Check its name and extension.`;
        return;
      }

      const extension = imageFormats[formatIndex];
      formatIndex++;

      image.src = `${collection.folder}/${number}.${extension}`;
    }

    image.addEventListener("error", tryNextFormat);

    figure.appendChild(image);
    grid.appendChild(figure);

    tryNextFormat();
  }
});