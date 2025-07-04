// HTTP 요청: 웹 브라우저나 프로그램이 서버에 "무언가 해달라"고 보내는 요청
// GET(서버에서 데이터 가져오기), POST(서버에 새로운 데이터 보내기), DELETE(서버에 데이터 삭제하기) 등
// API(Application Programming Interface): 서버가 외부에 제공하는 기능/데이터 출입구

// type Alias 방법을 통해 객체의 타입을 설정한다.
type Store = {
    currentPage: number;
    feeds: NewsFeed[];      // NewsFeed 유형의 데이터가 들어가는 배열
}

// tpye Alias에서 겹치는 것이 많다면 아래처럼 공통된 부분을 묶을 수 있다.
type News = {
    id: number;
    time_ago: string;
    title: string;
    url: string;
    user: string;
    content: string;
}
type NewsFeed = News & {
    comments_count: number;
    points: number;
    read?: boolean;         // 있을 때도 있고 없을 때도 있는 속성
}
type NewsDetail = News & {
    comments: NewsComment[];
}
type NewsComment = News & {
    comments: NewsComment[];
    level: number;
}

const ajax: XMLHttpRequest = new XMLHttpRequest();

const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";
const content = document.createElement("div");
const container: (HTMLElement | null) = document.getElementById("root");
const store: Store = {
    currentPage: 1,
    feeds: []
};

// 제너릭을 사용하여 함수가 전달할 return 값을 설정한다. (NewsFeed를 리턴할 지 아님 NewsDetail을 리턴할 지 결정함)
// 호출부에서 반환받고 싶은 유형을 작성하면 그 유형을 받아서 그대로 getData에서 반환 유형으로 사용하는 것이 제너릭
function getData<AjaxResponse>(url: string): AjaxResponse {
    ajax.open("GET", url, false);
    
    ajax.send();

    return JSON.parse(ajax.response);
}

// 타입 추론: for 문에서 i 에 타입 지정을 안 해줘도 타입스크립트가 i에 들어가는 type이 number일 것이라고 추정함
function makeFeeds(feeds) {
    for(let i = 0; i < feeds.length; i++) {
        feeds[i].read = false;
    }
    return feeds;
}

// container엔 HTML 요소 또는 Null이 들어가는 것이 가능함.
// container에 Null이 들어가면 innerHTML 속성을 사용하는 것이 불가능.
// container가 HTML요소일 때만 innerHTML을 사용하라고 명시해야 함.
function updateView(html) {
    if(container) {
        container.innerHTML = html;
    }
    else{
        console.error("최상위 컨테이너가 없어 UI를 진행하지 못합니다.");
    }
}

// JSON(Javascript Object Notation): 자바스크립트 객체 형식을 본뜬 "데이터 교환용 텍스트 형식"
// 클라이언트-서버 간 데이터 주고 받을 때, 외부 API 호출할 때 주로 씀
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
    let newsFeed: NewsFeed[] = store.feeds;
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
        newsFeed = store.feeds = makeFeeds(getData<NewsFeed[]>(NEWS_URL));
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

    updateView(template);
}

function newsDetail() {
    const id = location.hash.substring(7);

    const newsContent = getData<NewsDetail>(CONTENT_URL.replace("@id", id));
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

    updateView(template.replace('{{__comments__}}', makeComment(newsContent.comments)));
}