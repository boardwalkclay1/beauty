function showSection(type){

const content =
document.getElementById("content");

if(type==="garden"){

const poem =
poems[Math.floor(
Math.random()*poems.length)];

content.innerHTML=`

<div class="card">

<h2>🌹 Rose Garden</h2>

<p>${poem}</p>

</div>

`;
}

if(type==="teddy"){

const compliment=
compliments[Math.floor(
Math.random()*compliments.length)];

content.innerHTML=`

<div class="card">

<h2>🧸 Teddy Forest</h2>

<p>${compliment}</p>

</div>

`;
}

if(type==="riddles"){

const r =
riddles[Math.floor(
Math.random()*riddles.length)];

content.innerHTML=`

<div class="card">

<h2>🧩 Riddle Kingdom</h2>

<p>${r.question}</p>

<button onclick="
alert('${r.answer}')
">
Reveal
</button>

</div>

`;
}

if(type==="mirror"){

const compliment=
compliments[Math.floor(
Math.random()*compliments.length)];

content.innerHTML=`

<div class="card">

<h2>✨ Magic Mirror</h2>

<p>${compliment}</p>

</div>

`;
}

if(type==="vault"){

content.innerHTML=`

<div class="card">

<h2>💎 Beauty Vault</h2>

<p>
A collection of poems,
letters, memories,
and sweet surprises.
</p>

</div>

`;
}
}
``
