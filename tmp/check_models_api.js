const KEY = "AIzaSyBb8N5KJngMVxylnaarfeNGn8ZZ7-eqfzQ";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${KEY}`;

async function check() {
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

check();
