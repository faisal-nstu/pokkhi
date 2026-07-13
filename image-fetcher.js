const birds = [
  'bird name'
];

const sounds = [
  'sound url'
];

async function getImageUrl(species, sound) {
  try {
    // Search for image files matching the species name
    const searchUrl =
      `https://commons.wikimedia.org/w/api.php` +
      `?action=query` +
      `&generator=search` +
      `&gsrsearch=${encodeURIComponent(species)}` +
      `&gsrnamespace=6` +          // File namespace
      `&gsrlimit=1` +
      `&prop=imageinfo` +
      `&iiprop=url` +
      `&format=json` +
      `&origin=*`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!data.query?.pages) {
      console.warn(`${species}: No image found`);
      return;
    }

    const page = Object.values(data.query.pages)[0];

    if (!page.imageinfo?.length) {
      console.warn(`${species}: No image info`);
      return;
    }

    console.log(species + ':');
    console.log('Photo: ' + page.imageinfo[0].url);
    console.log('Sound: ' + sound);
    console.log("--------------------------------");
  } catch (err) {
    console.error(`${species}:`, err);
  }
}

(async () => {
  let index = 0;
  for (const bird of birds) {
    await getImageUrl(bird, sounds[index]);
    index++;
  }
})();