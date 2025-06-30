// HTTP 요청: 웹 브라우저나 프로그램이 서버에 "무언가 해달라"고 보내는 요청
// GET(서버에서 데이터 가져오기), POST(서버에 새로운 데이터 보내기), DELETE(서버에 데이터 삭제하기) 등


// API(Application Programming Interface): 서버가 외부에 제공하는 기능/데이터 출입구


// 브라우저에서 서버에 HTTP 요청을 보내고 응답을 받을 때 사용하는 오래된 방식의 API
const ajax = new XMLHttpRequest();

// "GET": 데이터를 가져오기 위한 GET 방식
// "https://api.hnpwa.com/v0/news/1.json": 호출할 API 주소
// false: 동기(synchronous) 요청:  이 요청이 완료될 때까지 다음 코드가 절대 실행되지 않음
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";
const content = document.createElement("div");
const container = document.getElementById("root");
const store = {
    currentPage: 1,
    feeds: []
};

function getData(url) {
    ajax.open("GET", url, false);
    
    // 실제로 서버에 요청을 보냄
    ajax.send();

    return JSON.parse(ajax.response);
}

function makeFeeds(feeds) {
    for(let i = 0; i < feeds.length; i++) {
        feeds[i].read = false;
    }
    return feeds;
}

// 응답 결과 (JSON 형식의 문자열)를 콘솔에 출력. 
// JSON(Javascript Object Notation): 자바스크립트 객체 형식을 본뜬 "데이터 교환용 텍스트 형식"
// 클라이언트-서버 간 데이터 주고 받을 때, 외부 API 호출할 때 주로 씀
// console.log(ajax.response);

// JSON을 parse로 객체로 바꿈(JSON은 객체로 변환 가능)
const ul = document.createElement("ul");

window.addEventListener("hashchange", router);

router();
function router() {
    const routePath = location.hash;        // location.hash에 #만 들어있을 땐 ""를 반환함

    if(routePath === "") {
        newsFeed();
    }
    else if(routePath.indexOf("#/page/") >= 0){
        store.currentPage = Number(routePath.substring(7));
        newsFeed();
    }
    else {
        newsDetail();
    }
}

function newsFeed() {
    let newsFeed = store.feeds;
    const newsList = [];
    let template = `
        <div class="bg-gray-600 min-h-screen">
            <div class="bg-white text-xl">
                <div class="mx-auto px-4">
                    <div class="flex justify-between items-center py-6">
                        <div class="flex justify-start">
                            <h1 class="font-extrabold">Hacker News</h1>
                        </div>
                        <div class="items-center justify-end">
                            <a href="#/page/{{__prev_page__}}" class="text-gray-500">
                                Previous
                            </a>
                            <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
                                Next
                            </a>
                        </div>
                    </div> 
                </div>
            </div>
            <div class="p-4 text-2xl text-gray-700">
                {{__news_feed__}}        
            </div>
        </div>
    `;

    if(newsFeed.length === 0) {
        newsFeed = store.feeds = makeFeeds(getData(NEWS_URL));
    }
    
    for(let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++){
        newsList.push(`
        <div class="p-6 ${newsFeed[i].read ? 'bg-red-500' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
            <div class="flex">
                <div class="flex-auto">
                    <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
                </div>
                <div class="text-center text-sm">
                    <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${newsFeed[i].comments_count}</div>
                </div>
            </div>
            <div class="flex mt-3">
                <div class="grid grid-cols-3 text-sm text-gray-500">
                    <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
                    <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
                    <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
                </div>  
            </div>
        </div>
        `);
    }
    
    template = template.replace("{{__news_feed__}}", newsList.join(""));
    template = template.replace("{{__prev_page__}}", store.currentPage > 1 ? store.currentPage - 1 : 1);
    template = template.replace("{{__next_page__}}", store.currentPage + 1);

    container.innerHTML = template;
}

function newsDetail() {
    const id = location.hash.substring(7);

    const newsContent = getData(CONTENT_URL.replace("@id", id));
    let template = `
        <div class="bg-gray-600 min-h-screen pb-8">
            <div class="bg-white text-xl">
                <div class="mx-auto px-4">
                    <div class="flex justify-between items-center py-6">
                        <div class="flex justify-start">
                            <h1 class="font-extrabold">Hacker News</h1>
                        </div>
                        <div class="items-center justify-end">
                            <a href="#/page/${store.currentPage}" class="text-gray-500">
                                <i class="fa fa-times"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="h-full border rounded-xl bg-white m-6 p-4 ">
                <h2>${newsContent.title}</h2>
                <div class="text-gray-400 h-20">
                    ${newsContent.content}
                </div>
                {{__comments__}}
            </div>
        </div>
    `;

    for(let i = 0; i < store.feeds.length; i++) {
        if(store.feeds[i].id === Number(id)) {
            store.feeds[i].read = true;
            break;
        }
    }

    function makeComment(comments, called = 0) {
        const commentString = [];

        for(let i = 0; i < comments.length; i++) {
            commentString.push(`
                <div style="padding-left: ${called * 40}px;" class="mt-4">
                    <div class="text-gray-400">
                        <i class="fa fa-sort-up mr-2"></i>
                        <strong>${comments[i].user}</strong> ${comments[i].time_ago}
                    </div>
                    <p class="text-gray-700">${comments[i].content}</p>
                </div>    
            `);

            if(comments[i].comments.length > 0) {
                commentString.push(makeComment(comments[i].comments, called + 1));
            }
        }
        return commentString.join("");
    }

    container.innerHTML = template.replace('{{__comments__}}', makeComment(newsContent.comments));
}