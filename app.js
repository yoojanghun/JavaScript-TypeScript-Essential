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

function getData(url) {
    ajax.open("GET", url, false);
    
    // 실제로 서버에 요청을 보냄
    ajax.send();

    return JSON.parse(ajax.response);
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
    else{
        newsDetail();
    }
}

function newsFeed() {
    const newsFeed = getData(NEWS_URL);
    const newsList = [];
    
    newsList.push("<ul>");
    
    for(let i = 0; i < 10; i++){
        newsList.push(`
            <li>
                <a href="#${newsFeed[i].id}">
                    ${newsFeed[i].title} (${newsFeed[i].comments_count})
                </a>
            </li>
        `);
    }
    
    newsList.push("</ul>");
    
    container.innerHTML = newsList.join("");
}

function newsDetail() {
    const id = location.hash.substring(1);

    const newsContent = getData(CONTENT_URL.replace("@id", id));

    container.innerHTML = `
        <h1>${newsContent.title}</h1>

        <div>
            <a href="#">목록으로</a>
        </div>
    `;
}