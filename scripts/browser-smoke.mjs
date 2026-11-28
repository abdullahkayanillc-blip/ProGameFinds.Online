import {chromium} from "playwright";
const baseURL=process.env.PREVIEW_URL||"https://progamefinds.online",failures=[];
const check=(v,m)=>{console.log((v?"PASS ":"FAIL ")+m);if(!v)failures.push(m);};
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 const response=await page.goto(baseURL,{waitUntil:"networkidle",timeout:45000});
 check(!!response&&response.ok(),"Homepage responds successfully");
 check((await page.title()).includes("Gaming Gear"),"Homepage title identifies gaming gear");
 check(await page.locator("h1").count()===1,"One primary H1");
 check((await page.locator("h1").innerText()).toLowerCase().includes("confidence"),"Professional gaming hero headline renders");
 check(await page.locator(".category-card").count()===10,"Ten gaming category cards render");
 const logo=page.locator(".brand img");check(await logo.count()>=1&&await logo.first().evaluate(img=>img.complete&&img.naturalWidth>0),"Brand logo loads");
 const productLink=page.locator('a[href="/gaming-products.html"]').first();check(await productLink.count()===1,"Gaming catalogue navigation exists");
 const productResponse=await page.request.get(new URL("/gaming-products.html",baseURL).toString());
 check(productResponse.ok(),"Gaming product catalogue responds successfully");
 const p=await browser.newPage({viewport:{width:1365,height:900}});
 await p.goto(new URL("/gaming-products.html",baseURL).toString(),{waitUntil:"networkidle",timeout:45000});
 const cards=p.locator(".product-card");check(await cards.count()>=20,"At least 20 product candidate cards render");
 const links=p.locator('a[href*="amazon.com/s?k="]');check(await links.count()===0,"No Amazon product-shopping links are present");
 const body=await p.locator("body").innerText();
 check(body.includes("Retail link status:"),"Catalogue explains that retail links are disabled");
 check(body.includes("Retail link currently unavailable."),"Product cards clearly show disabled retailer links");
 check(!body.includes("(affiliate link)"),"No affiliate labels remain visible");
 const metrics=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}));
 check(metrics.documentWidth<=metrics.width,"Desktop layout has no horizontal overflow");
 await page.setViewportSize({width:390,height:844});await page.reload({waitUntil:"networkidle"});
 const mobile=await page.evaluate(()=>{const menu=document.querySelector("details.mobile-nav");return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,menu:menu?getComputedStyle(menu).display:"missing"};});
 check(mobile.documentWidth<=mobile.width,"Mobile layout has no horizontal overflow");
 check(mobile.menu!=="none"&&mobile.menu!=="missing","Mobile navigation is visible");
 const researchResponse=await page.request.get(new URL("/gamesir-g7-pro-research.html",baseURL).toString());
 check(researchResponse.ok(),"GameSir G7 Pro research page responds successfully");
 const researchPage=await browser.newPage({viewport:{width:1440,height:960}});
 const researchErrors=[];researchPage.on("pageerror",e=>researchErrors.push(e.message));
 await researchPage.goto(new URL("/gamesir-g7-pro-research.html",baseURL).toString(),{waitUntil:"networkidle",timeout:45000});
 check((await researchPage.title()).includes("GameSir G7 Pro Research Profile"),"GameSir research page title renders");
 check((await researchPage.locator("h1").innerText()).includes("GameSir G7 Pro"),"GameSir research page H1 renders");
 check(await researchPage.locator('img[src="/assets/research-controller.svg"]').count()===1,"Original illustrative controller artwork renders");
 check(await researchPage.locator('a[href^="mailto:support@progamefinds.online"]').count()===1,"Community review email submission link renders");
 check(await researchPage.locator('a[href^="https://"]').count()===0,"No external tutorial or retailer links are published");
 const researchBody=await researchPage.locator("body").innerText();
 check(researchBody.includes("No community reviews published yet."),"No fabricated community reviews are displayed");
 check(researchBody.includes("Wired connection"),"Xbox wired-connection caveat is visible");
 const researchMobile=await researchPage.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));
 check(researchMobile.documentWidth<=researchMobile.width,"GameSir research page has no desktop horizontal overflow");
 await researchPage.setViewportSize({width:390,height:844});
 const researchMobileNarrow=await researchPage.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));
 check(researchMobileNarrow.documentWidth<=researchMobileNarrow.width,"GameSir research page has no mobile horizontal overflow");
 check(researchErrors.length===0,"GameSir research page has no uncaught browser errors");
 const guideIndexResponse=await page.request.get(new URL("/guides.html",baseURL).toString());
 check(guideIndexResponse.ok(),"Gaming guides index responds successfully");
 const guideIndex=await browser.newPage({viewport:{width:1440,height:960}});
 await guideIndex.goto(new URL("/guides.html",baseURL).toString(),{waitUntil:"networkidle",timeout:45000});
 check((await guideIndex.title()).includes("Gaming Buying Guides"),"Gaming guides index title renders");
 check((await guideIndex.locator("h1").innerText()).includes("Gaming buying guides"),"Gaming guides index H1 renders");
 const guideCards=guideIndex.locator(".category-card");
 check(await guideCards.count()===10,"Exactly ten original guide cards render");
 const guideHrefs=await guideCards.evaluateAll(nodes=>nodes.map(n=>n.getAttribute("href")));
 const expectedGuides=[
  "/guides/selecting-a-gaming-mouse.html",
  "/guides/selecting-a-gaming-keyboard.html",
  "/guides/gaming-headset-compatibility-guide.html",
  "/guides/controller-platform-compatibility.html",
  "/guides/gaming-monitor-resolution-refresh-rate.html",
  "/guides/wired-vs-wireless-gaming-gear-guide.html",
  "/guides/balanced-gaming-setup-planning.html",
  "/guides/gaming-desk-space-and-fit.html",
  "/guides/handheld-pc-gaming-accessory-compatibility.html",
  "/guides/verify-gaming-product-listing.html"
 ];
 check(JSON.stringify(guideHrefs)===JSON.stringify(expectedGuides),"Guide index links match all ten published article routes");
 const guideExternal=guideIndex.locator('a[href^="https://"],a[href^="http://"]');
 check(await guideExternal.count()===0,"Guides index has no external or retailer links");
 const guideIndexDesktop=await guideIndex.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));
 check(guideIndexDesktop.documentWidth<=guideIndexDesktop.width,"Guides index has no desktop horizontal overflow");
 await guideIndex.setViewportSize({width:390,height:844});
 const guideIndexMobile=await guideIndex.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,menu:getComputedStyle(document.querySelector("details.mobile-nav")).display}));
 check(guideIndexMobile.documentWidth<=guideIndexMobile.width,"Guides index has no mobile horizontal overflow");
 check(guideIndexMobile.menu!=="none","Guides index mobile menu remains visible");
 const article=await browser.newPage({viewport:{width:1365,height:900}});
 for(const path of expectedGuides){
  const response=await article.goto(new URL(path,baseURL).toString(),{waitUntil:"networkidle",timeout:45000});
  check(!!response&&response.ok(),path+" responds successfully");
  check(await article.locator("h1").count()===1,path+" has one primary heading");
  check((await article.locator("h1").innerText()).trim().length>=12,path+" has a descriptive heading");
  check((await article.title()).includes("ProGameFinds"),path+" has branded metadata title");
  check(await article.locator('a[href^="https://"],a[href^="http://"]').count()===0,path+" has no external or retailer links");
  const desktop=await article.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));
  check(desktop.documentWidth<=desktop.width,path+" has no desktop horizontal overflow");
  await article.setViewportSize({width:390,height:844});
  const mobile=await article.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));
  check(mobile.documentWidth<=mobile.width,path+" has no mobile horizontal overflow");
  await article.setViewportSize({width:1365,height:900});
 }
 const legacyGuide=await article.goto(new URL("/guides/choosing-a-gaming-mouse.html",baseURL).toString(),{waitUntil:"networkidle",timeout:45000});
 check(!!legacyGuide&&legacyGuide.ok()&&article.url().endsWith("/guides/selecting-a-gaming-mouse.html"),"Legacy gaming mouse guide redirects to its expanded article");
 const archiveResponse=await page.request.get(new URL("/product-research-archive.html",baseURL).toString());
 check(archiveResponse.ok(),"Historical research archive responds successfully");
 const a=await browser.newPage({viewport:{width:1440,height:1000}});
 const archiveErrors=[];a.on("pageerror",e=>archiveErrors.push(e.message));
 await a.goto(new URL("/product-research-archive.html",baseURL).toString(),{waitUntil:"networkidle",timeout:45000});
 check((await a.title()).includes("22-Product Research Archive"),"Archive title and metadata render");
 check(await a.locator(".archive-card").count()===22,"Exactly 22 historical product records render");
 check(await a.locator(".archive-card code").count()===20,"20 historical ASIN candidates are displayed");
 check(await a.locator('a[href*="amazon.com"]').count()===0,"Archive contains no Amazon shopping links");
 check(await a.locator(".archive-card").filter({hasText:"Not verified"}).count()>=20,"ASIN candidates are marked unverified");
 await a.locator("#archive-search").fill("Logitech");
 check(await a.locator(".archive-card:visible").count()===5,"Archive search filters matching records");
 await a.locator("#archive-search").fill("");
 await a.locator('button[data-archive-filter="controllers"]').click();
 check(await a.locator(".archive-card:visible").count()===4,"Archive category filter works");
 await a.setViewportSize({width:390,height:844});
 const archiveMobile=await a.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));
 check(archiveMobile.documentWidth<=archiveMobile.width,"Archive mobile layout has no horizontal overflow");
 check(archiveErrors.length===0,"Archive has no uncaught browser errors");
 check(errors.length===0,"No uncaught browser errors");
 console.log("BROWSER METRICS "+JSON.stringify({desktop:metrics,mobile,archiveMobile}));
}finally{await browser.close();}
if(failures.length){console.error("PROGAMEFINDS BROWSER QA FAILED: "+failures.length);process.exit(1);}
console.log("PROGAMEFINDS BROWSER QA PASSED");
