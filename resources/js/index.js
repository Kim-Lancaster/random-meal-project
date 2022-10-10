// Categories: Chicken, Beef, Pork, Seafood, Vegetarian, Vegan

//Assigning event handlers for protein buttons
if($('#front-tab').hasClass('selected')){
    $('#chicken').on('click', () => {
        ajaxGetProtein('Chicken')
    })
    $('#beef').on('click', () => {
        ajaxGetProtein('Beef');
    })
    $('#pork').on('click', () => {
        ajaxGetProtein('Pork');
    })
    $('#fish').on('click', () => {
        ajaxGetProtein('Seafood');
    })
    $('#vegi').on('click', () => {
        ajaxGetProtein('Vegetarian');
    }) 
}

// request for data from server
const ajaxGetProtein = (protein) => {
    $.ajax({
        method: 'GET',
        url: `https://www.themealdb.com/api/json/v1/1/filter.php?c=${protein}`,
        dataType: 'json',
        cache: 'false'
    }).done(function(data){
        grabFiveRandom(data);
    })
}

//Grabbing 5 meals from chosen protein at random
const grabFiveRandom = (rawObj) => {
    const mealNumsPicked = [];
    const len = rawObj.meals.length;
    let idArr = [];
    for(let i = 0; i < 5; i++){
        let choice = randGenerator(len);
        if(!mealNumsPicked.includes(choice)){
            mealNumsPicked.push(choice);
            idArr[`recipe${i + 1}`] = rawObj.meals[choice].idMeal;
            let name = rawObj.meals[choice].strMeal;
            let pic = rawObj.meals[choice].strMealThumb;
            populatePicsAndTabs(name, pic, i); 
        } else {
            i--;
        } 
    }
    addClickForTabs(idArr);
}

//Generate random number for grabFiveRandom()
const randGenerator = (arrlength) => {
    return Math.floor(Math.random() * arrlength);
}

//formatting data response from FIRST server response
const populatePicsAndTabs = (name, pic, index) => {
    $(`#recipe-name${index + 1}`).html(`Recipe${index + 1}<br>${name}`);
    $(`#food-image${index + 1}`).html(`<img src="${pic}" alt="${name}">`);
}

//Adding click event to all recipe tabs and index tab
const addClickForTabs = (arr) => {//I think the problem is here
    
    for(let i = 0; i < 5; i++){
         //clearing out old id from previous click event
        $(`#recipe${i + 1}`).off();
        //adding click event with new id
        $(`#recipe${i + 1}`).on('click', () => {
            ajaxGetInstructions(arr[`recipe${i + 1}`]);
        })
    }
    $('#front-tab').on('click', () => {
        $('.hidden-recipe-content').hide();
        $('.front-index-content').show();
    });
}

//Second server request for cooking instructions using id from first server response
const ajaxGetInstructions = (id) => {
    $.ajax({
        method: 'GET',
        url: `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
        dataType: 'json',
        cache: 'false'
    }).done(function(data){
        populateRecipe(data);
    })
}

//Adds dynamic content to website with instructions
const populateRecipe = (rawData) => {
    const extracted = extractData(rawData);
    $('.front-index-content').hide();
    //cleaning up any previous data
    cleanUp();
    $('.dish-name').html(`<h2>${extracted.name}</h2>`);
    $('.image-container').html(`<img src="${extracted.image}" alt="${extracted.name}">`);
    //adding ingredients line by line
    for(let i = 0; i < extracted.measurements.length; i++){
        $(`<p>${extracted.measurements[i]}.....${extracted.foodIngredients[i]}</p><br><br>`).appendTo('.ingredients');
    }
    //taking out \r and \n and replacing with <br>
    extracted.instructions = extracted.instructions.replace(/\r\n|\n|\r/g,'<br/>');
    $('.intructions').html(`<p>${extracted.instructions}</p>`).css('margin', '5%');
    //revealing only after all divs are populated
    $('.hidden-recipe-content').show();
}

//Extracts and cleans data from server response - Also end of the function daisy chain
const extractData = (data) => {
    const meal = data.meals[0]; //for easier access to usable data
    const name = meal.strMeal;
    const measurements = [];
    const foodIngredients = [];
    const instructions = meal.strInstructions;
    const image = meal.strMealThumb;
    let count = 1;
    for(const key in meal){
        if(key === `strIngredient${count}` && meal[key] !== ""){
            foodIngredients.push(meal[key]);
            count++;
        }
        if(key === `strIngredient${count}` && meal[key].length < 2){
            count = 1;
        }
        if(key === `strMeasure${count}` && meal[key] !== " " && meal[key] !== ""){
            measurements.push(meal[key]);
            count++;
        } 
    }

    return {name: name, image: image, measurements: measurements, foodIngredients: foodIngredients, instructions: instructions};
}

//Make sure hidden recipe section does not have any previous data
const cleanUp = () => {
    $('.dish-name').empty();
    $('.image-container').empty();
    $('.ingredients').empty();
    $('.intructions').empty();
}

//Making tabs look like they are selected
$("li").click(function(e) {
    e.preventDefault();
    $("li").removeClass("selected");
    $(this).addClass("selected");
  });

//Breakpoint for tab labels
if(parseInt($(window).width()) < 851){
    for(let i = 1; i < 6; i++){
        $(`#recipe${i}`).html(i)
    }
} 
$(window).on('resize', () =>{
    if(parseInt($(window).width()) < 851){
        for(let i = 1; i < 6; i++){
            $(`#recipe${i}`).html(i)
        }
    } else {
        for(let i = 1; i < 6; i++){
            $(`#recipe${i}`).html(`Recipe ${i}`);
        }
    }
});
