// It might be a good idea to add event listener to make sure this file 
// only runs after the DOM has finshed loading. 
const newQuoteForm = document.querySelector('#new-quote-form');
const editQuoteForm = document.querySelector('#edit-quote-form'); 
const editQuote = document.querySelector('#edit-quote');
const editAuthor = document.querySelector('#edit-author');
const quoteList = document.querySelector('#quote-list');
const alphabetize = document.querySelector('#alphabetize');
//const likesSort = document.querySelector('#likesSort');
const editDiv = document.querySelector('#edit-div');
let editShown = false;
let sort = false;
// let likeSort = false;

//globally store quotes and elements set in event listeners created in createElements()
let currentElement = null;
let currentQuote = null;

//dynamically update selected quote and author by storing and passing elements (p and footer)
let editP = null;
let editFooter = null;

document.addEventListener('DOMContentLoaded',function(){
    console.log('loaded');
    loadQuotes();
    newQuoteForm.addEventListener('submit', addQuote);
    editQuoteForm.addEventListener('submit', editQuoteInfo)
    alphabetize.addEventListener('click',function(){
        sort = !sort;
        loadQuotes();
        if(sort){
            alphabetize.innerText = "Sort by First Name: ON";
        }
        else{
            alphabetize.innerText = "Sort by First Name: OFF";
        }
    })
    // likesSort.addEventListener('click',function(){
    //     likeSort = !likeSort;
    //     loadQuotes();
    //     if(likeSort){
    //         likesSort.innerText = "Sort by Likes: ON";
    //     }
    //     else{
    //         likesSort.innerText = "Sort by Likes: OFF";
    //     }
    // })
})

// function sortByLikes(data){
    
// }

function alphabetizeData(data){
    //console.log(data);
    sortData = data.sort((a,b) => (a.author.toUpperCase().trim() > b.author.toUpperCase().trim()) ? 1: -1)
    return sortData;
}

function addQuote(e){
    e.preventDefault()
    const newQuote = document.querySelector('#new-quote');
    const newAuthor = document.querySelector('#author');
    
    fetch('http://localhost:3000/quotes',{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            quote: newQuote.value,
            likes: 0,
            author: newAuthor.value            
          })
    })
    .then(resp => resp.json())
    .then(data =>{
        //loadQuotes();
        createElement(data);
        newQuoteForm.reset();
    })
   
}

function removeQuote(id){
    fetch(`http://localhost:3000/quotes/${id}`,{
        method: "DELETE"
    })
    .then(resp => resp.json())
    .then(data =>{
        //loadQuotes();
    })
}
function addLike(quote){
    //let newLikes = parseInt(quote.likes) + 1;
    let newLikes = quote.likes;
    fetch(`http://localhost:3000/quotes/${quote.id}`,{
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            likes: newLikes            
          })
    })
    .then(resp => resp.json())
    .then(data =>{
        //loadQuotes();  
        currentElement.innerText = data.likes;
    })
}

// function fetchBeforeAdd(id){
//     //function to fetch quote id and passes it to addLike()
//     fetch(`http://localhost:3000/quotes/${id}`)
//     .then(resp => resp.json())
//     .then(data =>{
//         addLike(data);
//     })
// }

function editQuoteInfo(e){
    e.preventDefault();
    fetch(`http://localhost:3000/quotes/${currentQuote.id}`,{
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
        body: JSON.stringify({
            quote: editQuote.value,
            likes: currentQuote.likes,
            author: editAuthor.value
        })
    })
    .then(resp => resp.json())
    .then(data =>{
        //loadQuotes();
        editP.innerText = editQuote.value;
        editFooter.innerText = editAuthor.value;
        editQuoteForm.reset();

        if(editShown === false){
            editDiv.style.width = "300px";
            editShown = true;
        }
        else{
            editDiv.style.width = "0px";
            editShown = false;
        }
    })
}

function loadQuotes(){
    // const quoteList = document.querySelector('#quote-list');
    quoteList.innerHTML = "";
    fetch('http://localhost:3000/quotes')
    .then(resp => resp.json())
    .then(data => {
        if(sort){
            newData = alphabetizeData(data);
        }
        else{
            newData = data;
        }     
        newData.forEach(quote => {
            createElement(quote);
        }) 
    })
}

function createElement(quote){

    let li = document.createElement('li');
    li.className = "quote-card";
    let blockquote = document.createElement('blockquote');
    blockquote.className = "blockquote";
    let p = document.createElement('p');
    p.className = "mb-0";
    p.innerText = quote.quote;
    let footer = document.createElement('footer');
    footer.className = "blockquote-footer";
    footer.innerText = quote.author
    let like = document.createElement('button');
    like.innerText = "Likes: "
    like.className = "btn-success";
    let span = document.createElement('span');
    span.innerText = quote.likes;
    like.addEventListener('click',function(){
        //currentQuoteId = quote.id
        currentElement = span
        //fetchBeforeAdd(quote.id); 
        //avoids get request
        quote.likes = parseInt(quote.likes) + 1
        addLike(quote);    
    })
    
    like.appendChild(span)
    let remove = document.createElement('button');
    remove.innerText = "Delete"
    remove.className = "btn-danger";
    remove.addEventListener('click',function(e){
        e.target.parentElement.parentElement.remove()
        //currentQuoteId = quote.id
        removeQuote(quote.id)
    })
    let edit = document.createElement('button');
    edit.innerText = "Edit"
    edit.className = "btn-success";
    edit.addEventListener('click',function(){
        currentQuote = quote;
        //addLike(quote);
        editP = p;
        editFooter = footer;
        //editQuote(quote);
        if(editShown === false){
            editDiv.style.width = "300px";
            editShown = true;
        }
        else{
            editDiv.style.width = "0px";
            editShown = false;
        }
        editQuote.value = quote.quote;
        editAuthor.value = quote.author;
        
    })

    blockquote.appendChild(p);
    blockquote.appendChild(footer);
    blockquote.appendChild(like);
    blockquote.appendChild(remove);
    blockquote.appendChild(edit);
    li.appendChild(blockquote);
    quoteList.appendChild(li);
}