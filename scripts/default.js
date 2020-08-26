// simple form submission
async function submitSheetForm($form, sheetid, thankyou) {
    const formsink='https://script.google.com/macros/s/AKfycbxWFwI-qExw0Tg_LJvdisSYODFw35m3L8M5HdumPOufmArmRIEh/exec'
    let searchParams = new URLSearchParams(`?sheet-id=${sheetid}`);
    if ($form.reportValidity()) {
        $form.querySelectorAll(".form-field").forEach(($f) => {
            if ($f.getAttribute('type') == 'radio') {
                if ($f.checked) searchParams.append($f.name, $f.value);
            } else {
                searchParams.append($f.name, $f.value);
            }
        })
        const resp=await fetch(formsink+'?'+searchParams.toString());
        const json=await resp.json();
        if (json.status == 'ok') {
            window.location=thankyou;
        } else {
            alert ('Form Submission failed.')
            console.log(`form submission error: ${json.description}`);
        }    
    }
}

// html output for form fields
function getFieldHTML(name, type, options, attributes) {
    let html=`<label for="${name}">${name} ${attributes.mandatory?'*':''}</label><br>`;
    const r=attributes.mandatory?'required':'';

    if (type=='text') {
        html+=`<input class="form-field" type="text" id="${name}" name="${name}" ${r}><br>`;
    }

    if (type=='textarea') {
        html+=`<textarea class="form-field" id="${name}" name="${name}" rows=${attributes.rows} ${r}>`;
    }

    if (type=='radio') {
        options.forEach((o) => {
            html+=`<input class="form-field" type="radio" id="${name}" name="${name}" value="${o}" ${r}>
            <label for="${name}">${o}</label><br>`
        })
    }
    return (html);
}

// decorate a google sheets submitted form section

function decorateForm () {
    const sheetqs='main a[href^="https://docs.google.com/spreadsheets/"]';
    document.querySelectorAll(sheetqs).forEach(($a) => {
        const sheetid=$a.getAttribute('href').split('/')[5];
        const $div=$a.parentNode.parentNode;
        let thankyou='';
        $a.setAttribute('href','javascript:');
        $div.querySelectorAll('a').forEach(($diva) => {
            if ($diva.innerHTML.toLowerCase().trim() == 'thank you') {
                thankyou=$diva.getAttribute('href');
                $diva.parentNode.remove();
            }
        })
        $a.addEventListener('click', (e) => {
            submitSheetForm($form, sheetid, thankyou)
        });
        $div.classList.add('form');
        const $form=createTag('form');

        $div.querySelectorAll(':scope > p').forEach(($f) => {
            const $anchor=$f.querySelector('a');
            if (!$anchor) {
                const formfield=$f.firstChild.textContent;
                let attributes={};
                if (formfield.indexOf('*')) attributes.mandatory=true;
                let type='text';
                let options=[];
                const name=formfield.split('*')[0].trim();
    
                if ($f.nextElementSibling) {
                    $f.nextElementSibling.querySelectorAll('li').forEach(($li) => {
                        options.push($li.innerHTML)
                    });
                    if (options.length>0) {
                        $f.nextElementSibling.remove();
                        type='radio';
                    }
                }
    
                if (formfield.indexOf('[')>0) {
                    const descriptor=formfield.match(/\[(.*?)\]/)[1].toLowerCase().trim();
                    if (descriptor.endsWith('lines')) {
                        type='textarea'
                        attributes.rows=descriptor.split(' ')[0];
                    } else {
                        type=descriptor;
                    }
                }
    
                $f.innerHTML=getFieldHTML(name, type, options, attributes);    
            }
            $form.appendChild($f);
        })
        $div.appendChild($form);
    })
}


function wrapSections(element) {
    document.querySelectorAll(element).forEach(($div) => {
        const $wrapper=createTag('div', { class: 'section-wrapper'});
        $div.parentNode.appendChild($wrapper);
        $wrapper.appendChild($div);
    });
}




function unwrapEmbeds() {
    document.querySelectorAll(".section-embed").forEach(($embed) => {
        $embed.parentNode.classList.remove('default');
    })
}


let debounce = function(func, wait, immediate) {
	let timeout;
	return function() {
		let context = this, args = arguments;
		let later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		let callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};


// set fixed height to cards to create a uniform UI
function cardHeightEqualizer($el) {
    let initialHeight = 0;
    let element = document.querySelectorAll($el);

    if(window.innerWidth >= 700 && element.length > 1) {
        element.forEach(function(card_el) {
            card_el.style.height = 'auto';
        })
    
        element.forEach(function(card_text) {
            if(initialHeight < card_text.offsetHeight) {
                initialHeight = card_text.offsetHeight;
            }
        })
        
        element.forEach(function(card_el) {
            card_el.style.height = initialHeight + 'px';
        })
    } else {
        element.forEach(function(card_el) {
            card_el.style.height = 'auto';
        })
    }
}


function styleBackgrounds() {
    let backgrounds = document.querySelectorAll('.background');

    if(!backgrounds.length) return;
    
    backgrounds.forEach(function(background) {
        if(!background.childNodes[0]) return;
        if(background.childNodes[0].nodeName === "IMG") {
            let src = background.childNodes[0].getAttribute('src')
            background.style.backgroundImage = `url(${src})`;
            background.innerHTML = ``;
        }
        
    })
}


let runResizer = debounce(function() {
    cardHeightEqualizer('.premiere .card .text');
}, 250);

window.addEventListener('resize', runResizer);



function addNavCarrot() {
    let $svg = document.querySelector('header svg');

    if($svg) {
        let $svgParent = document.createElement('div');
        $svgParent.classList.add('nav-logo')
        
        $svgParent.innerHTML = `
            ${$svg.outerHTML}
            <span class="carrot">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </span>
        `
        document.querySelector('header > .section-wrapper > div > svg').remove();
        document.querySelector('header > .section-wrapper > div').prepend($svgParent)
    }
  }
  
  
  function dropDownMenu() {
    let $header = document.querySelector('header');
  
    if(window.outerWidth >= 768) return;
  
    if(!$header.classList.contains('nav-showing')) {
      $header.querySelector('ul').style.display = 'flex';
      $header.classList.add('nav-showing')
    } else {
      $header.querySelector('ul').style.display = 'none';
      $header.classList.remove('nav-showing')
    }
  }
  

function paramHelper() {
    if(!window.location.search) return;
    let query_type = new URLSearchParams(window.location.search);

    // Set Main Video
    // make sure video indicator is being requested
    if(query_type.get('v')) {
        let video_index;
        let parent_wrapper = document.querySelector('.cards');
        let mainVideo = document.createElement('div');
        if(query_type.get('v') === 'last') {
            video_index = parent_wrapper.querySelectorAll('.card').length - 1
        } else {
            video_index = query_type.get('v') - 1;
        }
        mainVideo.setAttribute('class', 'main-video');
        mainVideo.appendChild(document.querySelectorAll('.cards .card')[video_index].querySelector('div'));
        document.querySelectorAll('.cards .card')[video_index].remove();
        parent_wrapper.prepend(mainVideo);
    } 
}

async function decoratePage() {
    unwrapEmbeds();
    turnListSectionIntoCards();
    decorateTables();
    wrapSections('main>div');
    decorateForm();
    await loadLocalHeader();
    wrapSections('header>div');
    wrapSections('footer>div');
    window.pages.decorated = true;
    paramHelper();
    appearMain();
    // nav style/dropdown
    addNavCarrot();

    if(document.querySelector('.nav-logo')) {
      document.querySelector('.nav-logo').addEventListener('click', dropDownMenu)
    }
    styleBackgrounds();
    cardHeightEqualizer('.premiere .card .text');
}

function formatListCard($li) {
    const $p=$li.firstElementChild;
    let headhtml='';
    let texthtml='';
    Array.from($p.childNodes).forEach((node) => {
      if (node.nodeName == 'A') {
        const href=node.getAttribute('href');
        if (href.startsWith('https://www.youtube.com/')) {
          const yturl=new URL(href);
          const vid=yturl.searchParams.get('v');
          headhtml+=`<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"><iframe src="https://www.youtube.com/embed/${vid}?rel=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture"></iframe></div>`;
        } else {
          texthtml+=`<a href=${node.getAttribute('href')}>${node.innerHTML}</a>`;
        }          
      }
      if (node.nodeName == '#text') {
        texthtml+=`<p>${node.textContent}</p>`
      }

    });
    return (`<div class="card-image">${headhtml}</div><div class="card-text">${texthtml}</div>`);
  };
  
  function turnListSectionIntoCards() {
    document.querySelectorAll('main div.default>ul').forEach(($ul) => {
      if ($ul == $ul.parentNode.firstElementChild) {
        $ul.classList.remove('default');
        $ul.classList.add('cards');
        $ul.querySelectorAll('li').forEach(($li) => {
          $li.innerHTML=formatListCard($li);
        })
      }
    })
  }
  

  function toClassName(name) {
    return (name.toLowerCase().replace(/[^0-9a-z]/gi, '-'))
  }

  function decorateTables() {
    document.querySelectorAll('main div.default>table').forEach(($table) => {
        const $cols=$table.querySelectorAll('thead tr th');
        const cols=Array.from($cols).map((e) => toClassName(e.innerHTML));
        const $rows=$table.querySelectorAll('tbody tr');
        let $div={};

        if (cols.length==1 && $rows.length==1) {
            $div=createTag('div', {class:`${cols[0]}`});
            $div.innerHTML=$rows[0].querySelector('td').innerHTML;
        } else {
            $div=turnTableSectionIntoCards($table, cols) 
        }
        $table.parentNode.replaceChild($div, $table);
    });
  }

  function turnTableSectionIntoCards($table, cols) {
    const $rows=$table.querySelectorAll('tbody tr');
    const $cards=createTag('div', {class:`cards ${cols.join('-')}`})
    $rows.forEach(($tr) => {
        const $card=createTag('div', {class:'card'})
        $tr.querySelectorAll('td').forEach(($td, i) => {
            const $div=createTag('div', {class: cols[i]});
            const $a=$td.querySelector('a[href]');
            if ($a && $a.getAttribute('href').startsWith('https://www.youtube.com/')) {
                const yturl=new URL($a.getAttribute('href'));
                const vid=yturl.searchParams.get('v');
                $div.innerHTML=`<div class="video-thumb" style="background-image:url(https://img.youtube.com/vi/${vid}/0.jpg)"><svg xmlns="http://www.w3.org/2000/svg" width="731" height="731" viewBox="0 0 731 731">
                <g id="Group_23" data-name="Group 23" transform="translate(-551 -551)">
                    <circle id="Ellipse_14" data-name="Ellipse 14" cx="365.5" cy="365.5" r="365.5" transform="translate(551 551)" fill="#1473e6"/>
                    <path id="Polygon_3" data-name="Polygon 3" d="M87.5,0,175,152H0Z" transform="translate(992.5 829.5) rotate(90)" fill="#fff"/>
                </g>
                </svg>
                </div>`;
                $div.addEventListener('click', (evt) => {
                    $div.innerHTML=$div.innerHTML=`<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"><iframe src="https://www.youtube.com/embed/${vid}?rel=0&autoplay=1" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no" allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"></iframe></div>`;
                })
            } else {
                $div.innerHTML=$td.innerHTML;
            }
            $card.append($div);
        });
        $cards.append($card);
    });
    return ($cards);
  }


if (document.readyState == 'loading') {
    window.addEventListener('DOMContentLoaded', (event) => {
        decoratePage();
    });
} else {
    decoratePage();
}
