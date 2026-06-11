/* =====================================
   GROQ API KEY
===================================== */

const GROQ_API_KEY =
"";

/* =====================================
   GLOBAL VARIABLES
===================================== */

let currentProfile = null;

let currentRepos = [];

let chartInstance = null;

let profileAnalysis = {};

let loadingInterval;

/* =====================================
   LOADING MESSAGES
===================================== */

const loadingMessages = [

    "Fetching GitHub profile...",

    "Analyzing repositories...",

    "Calculating GitHub score...",

    "Detecting developer specialization...",

    "Generating AI insights...",

    "Preparing dashboard..."
];

/* =====================================
   SHOW LOADING
===================================== */

function showLoading(){

    const loading =
    document.getElementById(
        "loading"
    );

    loading.classList.remove(
        "hidden"
    );

    let index = 0;

    document.getElementById(
        "loadingText"
    ).innerText =
    loadingMessages[0];

    loadingInterval =

    setInterval(()=>{

        index++;

        if(
            index >=
            loadingMessages.length
        ){

            index = 0;
        }

        document
        .getElementById(
            "loadingText"
        )
        .innerText =

        loadingMessages[index];

    },1000);
}

/* =====================================
   HIDE LOADING
===================================== */

function hideLoading(){

    clearInterval(
        loadingInterval
    );

    document
    .getElementById(
        "loading"
    )
    .classList
    .add(
        "hidden"
    );
}

/* =====================================
   ERROR BOX
===================================== */

function showError(message){

    const errorBox =

    document.getElementById(
        "errorBox"
    );

    errorBox.innerText =
    message;

    errorBox.classList.remove(
        "hidden"
    );
}

function hideError(){

    document
    .getElementById(
        "errorBox"
    )
    .classList
    .add(
        "hidden"
    );
}

/* =====================================
   SHOW DASHBOARD
===================================== */

function showSections(){

    const sections = [

        "scoreSection",

        "developerSection",

        "stackSection",

        "insightsSection",

        "repoSection",

        "activitySection",

        "chartSection",

        "questionSection",

        "downloadSection"
    ];

    sections.forEach(id=>{

        document
        .getElementById(id)
        .classList
        .remove(
            "hidden"
        );

    });
}

/* =====================================
   MAIN ANALYSIS
===================================== */

async function getProfile(){

    hideError();

    const username =

    document
    .getElementById(
        "username"
    )
    .value
    .trim();

    if(!username){

        showError(
            "Please enter a GitHub username."
        );

        return;
    }

    showLoading();

    try{

        const profileResponse =

        await fetch(

        `https://api.github.com/users/${username}`

        );

        const profile =

        await profileResponse.json();

        if(profile.message){

            hideLoading();

            showError(
                "GitHub user not found."
            );

            return;
        }

        const repoResponse =

        await fetch(

        `https://api.github.com/users/${username}/repos?per_page=100`

        );

        const repos =

        await repoResponse.json();

        currentProfile =
        profile;

        currentRepos =
        repos;

        renderProfile(
            profile
        );

        calculateScores(
            profile,
            repos
        );

        classifyDeveloper(
            repos
        );

        detectTechStack(
            repos
        );

        generateLanguageSummary(
            repos
        );

        generateInsights(
            profile,
            repos
        );

        generateRepoTable(
            repos
        );

        generateTimeline(
            repos
        );

        createLanguageChart(
            repos
        );

        calculateProfileQuality();

        showSections();

        hideLoading();

    }

    catch(error){

        console.error(
            error
        );

        hideLoading();

        showError(
            "Unable to fetch GitHub profile."
        );
    }
}

/* =====================================
   PROFILE CARD
===================================== */

function renderProfile(profile){

    document
    .getElementById(
        "dashboard"
    )
    .innerHTML =

`
<div class="profile-card">

<img
src="${profile.avatar_url}"
alt="Profile">

<h2>

${profile.name ||
profile.login}

</h2>

<p>

${profile.bio ||
"No bio available"}

</p>

<p>

Followers:
${profile.followers}

</p>

<p>

Following:
${profile.following}

</p>

<p>

Repositories:
${profile.public_repos}

</p>

<a
href="${profile.html_url}"
target="_blank">

View GitHub Profile

</a>

</div>
`;
}

/* =====================================
   TOTAL STARS
===================================== */

function getTotalStars(){

    return currentRepos.reduce(

        (total,repo)=>

        total +

        repo.stargazers_count,

        0
    );
}

/* =====================================
   TOP LANGUAGE
===================================== */

function getTopLanguage(){

    const languages = {};

    currentRepos.forEach(repo=>{

        if(repo.language){

            languages[
                repo.language
            ] =

            (
                languages[
                    repo.language
                ] || 0
            ) + 1;
        }
    });

    let topLanguage = "";

    let maxCount = 0;

    Object.keys(
        languages
    ).forEach(language=>{

        if(

            languages[
                language
            ] > maxCount

        ){

            maxCount =

            languages[
                language
            ];

            topLanguage =
            language;
        }

    });

    return topLanguage;
}

/* =====================================
   GITHUB SCORE + CAREER SCORE
===================================== */

function calculateScores(
    profile,
    repos
){

    const totalStars =
    getTotalStars();

    const followers =
    profile.followers;

    const repoCount =
    repos.length;

    const accountAge =

    new Date().getFullYear()

    -

    new Date(
        profile.created_at
    ).getFullYear();

    let githubScore = 0;

    /* REPOSITORIES */

    githubScore +=
    Math.min(
        25,
        repoCount
    );

    /* STARS */

    githubScore +=
    Math.min(
        25,
        totalStars
    );

    /* FOLLOWERS */

    githubScore +=
    Math.min(
        20,
        followers
    );

    /* BIO */

    if(profile.bio){

        githubScore += 10;
    }

    /* ACCOUNT AGE */

    githubScore +=
    Math.min(
        20,
        accountAge * 4
    );

    if(
        githubScore > 100
    ){

        githubScore = 100;
    }

    /* CAREER SCORE */

    let careerScore =

        githubScore;

    const descriptions =

        repos.filter(

            repo =>

            repo.description

        ).length;

    if(

        descriptions /

        Math.max(
            repoCount,
            1
        )

        > 0.6

    ){

        careerScore += 5;
    }

    if(
        careerScore > 100
    ){

        careerScore = 100;
    }

    document
    .getElementById(
        "githubScore"
    )
    .innerText =
    githubScore;

    document
    .getElementById(
        "careerScore"
    )
    .innerText =
    careerScore + "%";

    document
    .getElementById(
        "totalStars"
    )
    .innerText =
    totalStars;

    document
    .getElementById(
        "repoCount"
    )
    .innerText =
    repoCount;

    profileAnalysis.githubScore =
    githubScore;

    profileAnalysis.careerScore =
    careerScore;
}

/* =====================================
   DEVELOPER CLASSIFICATION
===================================== */

function classifyDeveloper(
    repos
){

    const evidence = [];

    let aiScore = 0;

    let webScore = 0;

    let backendScore = 0;

    let mobileScore = 0;

    let devopsScore = 0;

    const topLanguage =
    getTopLanguage();

    repos.forEach(repo=>{

        const name =

        repo.name
        .toLowerCase();

        /* AI */

        if(

            name.includes("ai")

            ||

            name.includes("ml")

            ||

            name.includes(
                "machine"
            )

            ||

            name.includes(
                "deep"
            )

            ||

            name.includes(
                "neural"
            )

        ){

            aiScore += 15;

            if(

                !evidence.includes(

                "AI repositories detected"

                )

            ){

                evidence.push(

                "AI repositories detected"

                );
            }
        }

        /* WEB */

        if(

            name.includes("web")

            ||

            name.includes("react")

            ||

            name.includes("frontend")

            ||

            name.includes("portfolio")

            ||

            name.includes("html")

        ){

            webScore += 15;

            if(

                !evidence.includes(

                "Frontend projects detected"

                )

            ){

                evidence.push(

                "Frontend projects detected"

                );
            }
        }

        /* BACKEND */

        if(

            name.includes("api")

            ||

            name.includes("backend")

            ||

            name.includes("server")

        ){

            backendScore += 15;
        }

        /* MOBILE */

        if(

            name.includes("android")

            ||

            name.includes("flutter")

            ||

            name.includes("mobile")

        ){

            mobileScore += 15;
        }

        /* DEVOPS */

        if(

            name.includes("docker")

            ||

            name.includes("kubernetes")

            ||

            name.includes("devops")

        ){

            devopsScore += 15;
        }

    });

    /* LANGUAGE BONUS */

    if(
        topLanguage ===
        "Python"
    ){

        aiScore += 20;

        evidence.push(
            "Python dominates repositories"
        );
    }

    if(
        topLanguage ===
        "JavaScript"
    ){

        webScore += 20;

        evidence.push(
            "JavaScript dominates repositories"
        );
    }

    if(
        topLanguage ===
        "Java"
    ){

        backendScore += 20;
    }

    const roles = [

        {
            type:
            "AI / ML Engineer",

            score:
            aiScore
        },

        {
            type:
            "Frontend Developer",

            score:
            webScore
        },

        {
            type:
            "Backend Developer",

            score:
            backendScore
        },

        {
            type:
            "Mobile Developer",

            score:
            mobileScore
        },

        {
            type:
            "DevOps Engineer",

            score:
            devopsScore
        }

    ];

    roles.sort(

        (a,b)=>

        b.score -

        a.score

    );

    const bestRole =
    roles[0];

    let confidence =

        Math.min(

            95,

            50 +

            bestRole.score

        );

    document
    .getElementById(
        "developerType"
    )
    .innerHTML =

`
<h3>

${bestRole.type}

</h3>

<br>

<b>

Confidence:

</b>

${confidence}%

<br><br>

<b>

Evidence:

</b>

<ul>

${evidence.map(

item =>

`<li>${item}</li>`

).join("")}

</ul>
`;

    profileAnalysis
    .developerType =
    bestRole.type;

    profileAnalysis
    .developerConfidence =
    confidence;

    profileAnalysis
    .evidence =
    evidence;
}

/* =====================================
   TECH STACK DETECTION
===================================== */

function detectTechStack(
    repos
){

    const container =

    document
    .getElementById(
        "techStack"
    );

    container.innerHTML = "";

    const languageMap = {};

    repos.forEach(repo=>{

        if(repo.language){

            languageMap[
                repo.language
            ] =

            (
                languageMap[
                    repo.language
                ] || 0
            ) + 1;
        }

    });

    Object.keys(
        languageMap
    )

    .sort(

        (a,b)=>

        languageMap[b]

        -

        languageMap[a]

    )

    .forEach(language=>{

        container.innerHTML +=

`
<div class="stack-card">

<h3>

${language}

</h3>

<p>

${languageMap[language]}
 repositories

</p>

</div>
`;

    });

    profileAnalysis.languages =
    languageMap;
}

/* =====================================
   LANGUAGE SUMMARY
===================================== */

function generateLanguageSummary(
    repos
){

    const languages =

    Object.keys(

        profileAnalysis
        .languages || {}

    );

    const topLanguage =
    getTopLanguage();

    const diversity =

    languages.length;

    let diversityText =
    "Low";

    if(diversity >= 5){

        diversityText =
        "High";
    }

    else if(
        diversity >= 3
    ){

        diversityText =
        "Medium";
    }

    document
    .getElementById(
        "languageSummary"
    )
    .innerHTML =

`
<b>Primary Language:</b>
${topLanguage}

<br><br>

<b>Languages Used:</b>
${languages.join(", ")}

<br><br>

<b>Diversity:</b>
${diversityText}

<br><br>

<b>Developer Focus:</b>
${profileAnalysis.developerType}

<br><br>

<b>Confidence:</b>
${profileAnalysis.developerConfidence}%
`;
}

/* =====================================
   AI INSIGHTS
===================================== */

function generateInsights(
    profile,
    repos
){

    const insights = [];

    const totalStars =
    getTotalStars();

    const repoCount =
    repos.length;

    const followers =
    profile.followers;

    const topLanguage =
    getTopLanguage();

    const missingDescriptions =

    repos.filter(

        repo =>

        !repo.description

    ).length;

    /* STRENGTHS */

    if(
        topLanguage ===
        "Python"
    ){

        insights.push(

        "Profile demonstrates strong Python expertise, making it suitable for AI/ML, automation, and backend development."

        );
    }

    if(
        totalStars > 0
    ){

        insights.push(

        `Projects have received ${totalStars} stars, indicating community recognition and project usefulness.`

        );
    }

    if(
        repoCount >= 10
    ){

        insights.push(

        "Repository count indicates consistent project-building activity."

        );
    }

    /* IMPROVEMENTS */

    if(
        missingDescriptions > 0
    ){

        insights.push(

        `${missingDescriptions} repositories are missing descriptions, which can reduce recruiter visibility.`

        );
    }

    if(
        followers < 10
    ){

        insights.push(

        "Increasing GitHub engagement and networking can improve profile visibility."

        );
    }

    /* CAREER */

    insights.push(

    `Current profile is most aligned with ${profileAnalysis.developerType}.`

    );

    insights.push(

    "Adding detailed README files and project screenshots would significantly improve portfolio quality."

    );

    const grid =

    document.getElementById(
        "insightsGrid"
    );

    grid.innerHTML = "";

    insights.forEach(insight=>{

        grid.innerHTML +=

`
<div class="insight-card">

${insight}

</div>
`;

    });

    profileAnalysis.insights =
    insights;
}

/* =====================================
   TOP 5 REPOSITORIES
===================================== */

function generateRepoTable(
    repos
){

    const table =

    document.getElementById(
        "repoTable"
    );

    table.innerHTML = "";

    const topRepos =

    [...repos]

    .sort(

        (a,b)=>

        b.stargazers_count -

        a.stargazers_count

    )

    .slice(0,5);

    topRepos.forEach(repo=>{

        table.innerHTML +=

`
<tr>

<td>

<a
href="${repo.html_url}"
target="_blank">

${repo.name}

</a>

</td>

<td>

${repo.language || "-"}

</td>

<td>

${repo.stargazers_count}

</td>

</tr>
`;

    });

    profileAnalysis.topRepos =
    topRepos;
}

/* =====================================
   RECENT ACTIVITY TIMELINE
===================================== */

function generateTimeline(
    repos
){

    const timeline =

    document.getElementById(
        "activityTimeline"
    );

    timeline.innerHTML = "";

    const recentRepos =

    [...repos]

    .sort(

        (a,b)=>

        new Date(
            b.updated_at
        )

        -

        new Date(
            a.updated_at
        )

    )

    .slice(0,5);

    recentRepos.forEach(repo=>{

        timeline.innerHTML +=

`
<div class="timeline-item">

<strong>

${repo.name}

</strong>

<br><br>

Updated:
${new Date(
    repo.updated_at
).toLocaleDateString()}

<br><br>

Language:
${repo.language || "N/A"}

</div>
`;

    });

}

/* =====================================
   PROFILE QUALITY SCORE
===================================== */

function calculateProfileQuality(){

    let score = 100;

    const missingDescriptions =

    currentRepos.filter(

        repo =>

        !repo.description

    ).length;

    score -=
    missingDescriptions * 3;

    if(
        !currentProfile.bio
    ){

        score -= 10;
    }

    if(
        currentProfile.followers < 5
    ){

        score -= 5;
    }

    if(score < 0){

        score = 0;
    }

    profileAnalysis.profileQuality =
    score;
}

/* =====================================
   LANGUAGE DISTRIBUTION CHART
===================================== */

function createLanguageChart(
    repos
){

    const languageMap = {};

    repos.forEach(repo=>{

        if(repo.language){

            languageMap[
                repo.language
            ] =

            (
                languageMap[
                    repo.language
                ] || 0
            ) + 1;
        }

    });

    const labels =

    Object.keys(
        languageMap
    );

    const values =

    Object.values(
        languageMap
    );

    const canvas =

    document.getElementById(
        "languageChart"
    );

    if(!canvas){

        return;
    }

    const ctx =

    canvas.getContext(
        "2d"
    );

    if(chartInstance){

        chartInstance.destroy();
    }

    chartInstance =

    new Chart(ctx,{

        type:"doughnut",

        data:{

            labels:labels,

            datasets:[{

                data:values,

                borderWidth:2,

                backgroundColor:[

                    "#ffffff",

                    "#d6d6d6",

                    "#b5b5b5",

                    "#909090",

                    "#6f6f6f",

                    "#555555",

                    "#3a3a3a",

                    "#222222"

                ]

            }]
        },

        plugins:[
            ChartDataLabels
        ],

        options:{

            responsive:true,

            maintainAspectRatio:false,

            cutout:"60%",

            plugins:{

                legend:{

                    position:"bottom",

                    labels:{

                        color:"#ffffff",

                        padding:20,

                        font:{

                            size:13
                        }
                    }
                },

                datalabels:{

                    color:"#000",

                    font:{

                        weight:"bold",

                        size:12
                    },

                    formatter:(value,ctx)=>{

                        const total =

                        ctx.dataset.data.reduce(

                            (a,b)=>

                            a+b,

                            0

                        );

                        return Math.round(

                            value /
                            total *
                            100

                        ) + "%";
                    }
                }
            }
        }
    });
}

/* =====================================
   GROQ AI
===================================== */

async function askAI(prompt){

    try{

        const response =

        await fetch(

        "https://api.groq.com/openai/v1/chat/completions",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json",

                "Authorization":
                `Bearer ${GROQ_API_KEY}`

            },

            body:JSON.stringify({

                model:
                "llama-3.3-70b-versatile",

                messages:[

                    {

                        role:"system",

                        content:
`
You are an expert GitHub recruiter,
career mentor and software engineer.

Analyze GitHub profiles professionally.

Give:
- strengths
- weaknesses
- internship readiness
- job readiness
- developer classification
- career recommendations

Keep answers concise.
`
                    },

                    {

                        role:"user",

                        content:prompt

                    }

                ],

                temperature:0.7,

                max_tokens:500

            })

        });

        const data =

        await response.json();

        console.log(
            "Groq Response:",
            data
        );

        if(data.error){

            return data.error.message;
        }

        return data
        ?.choices?.[0]
        ?.message?.content

        ||

        "No response generated.";

    }

    catch(error){

        console.error(error);

        return "Unable to generate AI response.";
    }
}

/* =====================================
   ASK ABOUT PROFILE
===================================== */

async function answerQuestion(){

    const question =

    document
    .getElementById(
        "questionInput"
    )
    .value
    .toLowerCase()
    .trim();

    const answerBox =

    document
    .getElementById(
        "questionAnswer"
    );

    if(!question){

        answerBox.innerHTML =
        "Please ask a question.";

        return;
    }

    const githubScore =
    profileAnalysis.githubScore;

    const careerScore =
    profileAnalysis.careerScore;

    const developerType =
    profileAnalysis.developerType;

    const totalStars =
    getTotalStars();

    const repoCount =
    currentRepos.length;

    let answer = "";

    /* STRENGTHS */

    if(
        question.includes("strength")
    ){

        answer =

        `
        Strengths:

        • Developer Type:
        ${developerType}

        • GitHub Score:
        ${githubScore}/100

        • Total Repositories:
        ${repoCount}

        • Total Stars:
        ${totalStars}

        • Strongest Language:
        ${getTopLanguage()}
        `;
    }

    /* WEAKNESSES */

    else if(
        question.includes("weak")
    ){

        answer =

        `
        Areas for Improvement:

        • Add more repository descriptions

        • Improve README files

        • Increase GitHub engagement

        • Add project screenshots

        • Build more advanced projects
        `;
    }

    /* INTERNSHIP */

    else if(

        question.includes(
            "internship"
        )

    ){

        if(careerScore >= 80){

            answer =

            `
            This profile appears internship ready.

            Strong repository activity,
            good technology stack,
            and consistent project work.
            `;
        }

        else{

            answer =

            `
            More projects and documentation
            are recommended before applying
            for internships.
            `;
        }
    }

    /* JOB READY */

    else if(

        question.includes("job")

        ||

        question.includes("hire")

    ){

        if(careerScore >= 85){

            answer =

            `
            This profile shows strong
            job readiness and demonstrates
            practical development skills.
            `;
        }

        else{

            answer =

            `
            Additional projects,
            contributions,
            and documentation
            would improve job readiness.
            `;
        }
    }

    /* WEB DEVELOPMENT */

    else if(

        question.includes("web")

    ){

        if(

            developerType.includes(
                "Frontend"
            )

        ){

            answer =

            `
            This profile is suitable
            for Web Development roles.

            Strong JavaScript and
            frontend indicators detected.
            `;
        }

        else{

            answer =

            `
            Limited web development
            evidence detected.

            More frontend projects
            are recommended.
            `;
        }
    }

    /* AI ML */

    else if(

        question.includes("ai")

        ||

        question.includes("ml")

        ||

        question.includes(
            "machine learning"
        )

    ){

        answer =

        `
        AI / ML Analysis:

        Developer Type:
        ${developerType}

        Top Language:
        ${getTopLanguage()}

        GitHub Score:
        ${githubScore}

        Confidence:
        ${profileAnalysis.developerConfidence}%
        `;
    }

    /* REPOSITORIES */

    else if(

        question.includes("repo")

        ||

        question.includes(
            "repository"
        )

    ){

        answer =

        `
        Repository Statistics:

        Total Repositories:
        ${repoCount}

        Total Stars:
        ${totalStars}

        Primary Language:
        ${getTopLanguage()}
        `;
    }

    /* DEFAULT */

    else{

        answer =

        `
        I can answer questions about:

        • Strengths

        • Weaknesses

        • Internship Readiness

        • Job Readiness

        • AI/ML Focus

        • Web Development

        • Repositories

        • Career Recommendations
        `;
    }

    answerBox.innerHTML =
    answer.replace(
        /\n/g,
        "<br>"
    );
}
/* =====================================
   PDF REPORT
===================================== */

async function downloadPDF(){

    const { jsPDF } =
    window.jspdf;

    const pdf =
    new jsPDF();

    let y = 20;

    pdf.setFontSize(18);

    pdf.text(

        "GitHub Profile Analysis Report",

        20,

        y

    );

    y += 10;

    pdf.setFontSize(12);

    pdf.text(

        `Name: ${
        currentProfile.name ||
        currentProfile.login
        }`,

        20,

        y

    );

    y += 10;

    pdf.text(

        `Developer Type: ${
        profileAnalysis.developerType
        }`,

        20,

        y

    );

    y += 10;

    pdf.text(

        `Confidence: ${
        profileAnalysis.developerConfidence
        }%`,

        20,

        y

    );

    y += 10;

    pdf.text(

        `GitHub Score: ${
        profileAnalysis.githubScore
        }`,

        20,

        y

    );

    y += 10;

    pdf.text(

        `Career Score: ${
        profileAnalysis.careerScore
        }%`,

        20,

        y

    );

    y += 15;

    pdf.text(

        "AI Insights:",

        20,

        y

    );

    y += 10;

    profileAnalysis.insights
    .forEach(insight=>{

        const lines =

        pdf.splitTextToSize(

            "- " + insight,

            170

        );

        pdf.text(

            lines,

            20,

            y

        );

        y +=
        lines.length * 7;

    });

    y += 10;

    pdf.text(

        "Top Repositories:",

        20,

        y

    );

    y += 10;

    profileAnalysis.topRepos
    .forEach(repo=>{

        pdf.text(

        `${repo.name} - (${repo.stargazers_count} stars)`,

        20,

        y

        );

        y += 15;

    });

    pdf.save(

        `${
        currentProfile.login
        }-GitHub-Report.pdf`

    );
}

/* =====================================
   ENTER KEY SUPPORT
===================================== */

document
.getElementById(
    "username"
)
.addEventListener(

    "keypress",

    function(e){

        if(
            e.key === "Enter"
        ){

            getProfile();
        }
    }

);

document
.getElementById(
    "questionInput"
)
.addEventListener(

    "keypress",

    function(e){

        if(
            e.key === "Enter"
        ){

            answerQuestion();
        }
    }

);

/* =====================================
   PDF BUTTON
===================================== */

document
.getElementById(
    "pdfBtn"
)
.addEventListener(

    "click",

    downloadPDF

);

/* =====================================
   STARTUP
===================================== */

hideError();