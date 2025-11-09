fetch('/data/Books.csv').then(r=>r.text()).then(t=>{
 const data=Papa.parse(t,{header:true}).data;
 const c=document.getElementById('books-grid');
 c.innerHTML=data.map(b=>`<div><h3>${b.Title}</h3><p>${b['Publication Date']}</p></div>`).join('');
});