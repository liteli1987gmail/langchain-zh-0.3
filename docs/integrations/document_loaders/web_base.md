---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/web_base.ipynb
---
# WebBaseLoader

这部分介绍了如何使用 `WebBaseLoader` 从 `HTML` 网页加载所有文本到我们可以在后续使用的文档格式中。有关加载网页的更多自定义逻辑，请查看一些子类示例，如 `IMSDbLoader`、`AZLyricsLoader` 和 `CollegeConfidentialLoader`。

如果您不想担心网站爬虫、绕过 JS 阻止的网站和数据清理，请考虑使用 `FireCrawlLoader` 或更快的选项 `SpiderLoader`。

## 概述
### 集成细节

- TODO: 填写表格特性。
- TODO: 如果不相关，请删除 JS 支持链接，否则确保链接正确。
- TODO: 确保 API 参考链接正确。

| 类别 | 包名 | 本地 | 可序列化 | JS 支持 |
| :--- | :--- | :---: | :---: |  :---: |
| [WebBaseLoader](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html) | [langchain_community](https://python.langchain.com/api_reference/community/index.html) | ✅ | ❌ | ❌ |
### 加载器特性
| 来源 | 文档懒加载 | 原生异步支持
| :---: | :---: | :---: |
| WebBaseLoader | ✅ | ✅ |

## 设置

### 凭证

`WebBaseLoader` 不需要任何凭证。

### 安装

要使用 `WebBaseLoader`，您首先需要安装 `langchain-community` python 包。



```python
%pip install -qU langchain_community beautifulsoup4
```

## 初始化

现在我们可以实例化我们的模型对象并加载文档：


```python
<!--IMPORTS:[{"imported": "WebBaseLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html", "title": "WebBaseLoader"}]-->
from langchain_community.document_loaders import WebBaseLoader

loader = WebBaseLoader("https://www.espn.com/")
```

要绕过获取过程中的SSL验证错误，您可以设置“verify”选项：

`loader.requests_kwargs = {'verify':False}`

### 多页面初始化

您还可以传入一个页面列表进行加载。


```python
loader_multiple_pages = WebBaseLoader(["https://www.espn.com/", "https://google.com"])
```

## 加载


```python
docs = loader.load()

docs[0]
```



```output
Document(metadata={'source': 'https://www.espn.com/', 'title': 'ESPN - Serving Sports Fans. Anytime. Anywhere.', 'description': 'Visit ESPN for live scores, highlights and sports news. Stream exclusive games on ESPN+ and play fantasy sports.', 'language': 'en'}, page_content="\n\n\n\n\n\n\n\n\nESPN - Serving Sports Fans. Anytime. Anywhere.\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n        Skip to main content\n    \n\n        Skip to navigation\n    \n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n<\n\n>\n\n\n\n\n\n\n\n\n\nMenuESPN\n\n\n\n\n\nscores\n\n\n\nNFLNBAMLBOlympicsSoccerWNBA…BoxingCFLNCAACricketF1GolfHorseLLWSMMANASCARNBA G LeagueNBA Summer LeagueNCAAFNCAAMNCAAWNHLNWSLPLLProfessional WrestlingRacingRN BBRN FBRugbySports BettingTennisX GamesUFLMore ESPNFantasyWatchESPN BETESPN+\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n  \n\nSubscribe Now\n\n\n\n\n\nBoxing: Crawford vs. Madrimov (ESPN+ PPV)\n\n\n\n\n\n\n\nPFL Playoffs: Heavyweights & Women's Flyweights\n\n\n\n\n\n\n\nMLB\n\n\n\n\n\n\n\nLittle League Baseball: Regionals\n\n\n\n\n\n\n\nIn The Arena: Serena Williams\n\n\n\n\n\n\n\nThe 30 College Football Playoff Contenders\n\n\nQuick Links\n\n\n\n\n2024 Paris Olympics\n\n\n\n\n\n\n\nOlympics: Everything to Know\n\n\n\n\n\n\n\nMLB Standings\n\n\n\n\n\n\n\nSign up: Fantasy Football\n\n\n\n\n\n\n\nWNBA Rookie Tracker\n\n\n\n\n\n\n\nNBA Free Agency Buzz\n\n\n\n\n\n\n\nLittle League Baseball, Softball\n\n\n\n\n\n\n\nESPN Radio: Listen Live\n\n\n\n\n\n\n\nWatch Golf on ESPN\n\n\n\n\n\n\nFavorites\n\n\n\n\n\n\n      Manage Favorites\n      \n\n\n\nCustomize ESPNCreate AccountLog InFantasy\n\n\n\n\nFootball\n\n\n\n\n\n\n\nBaseball\n\n\n\n\n\n\n\nBasketball\n\n\n\n\n\n\n\nHockey\n\n\nESPN Sites\n\n\n\n\nESPN Deportes\n\n\n\n\n\n\n\nAndscape\n\n\n\n\n\n\n\nespnW\n\n\n\n\n\n\n\nESPNFC\n\n\n\n\n\n\n\nX Games\n\n\n\n\n\n\n\nSEC Network\n\n\nESPN Apps\n\n\n\n\nESPN\n\n\n\n\n\n\n\nESPN Fantasy\n\n\n\n\n\n\n\nTournament Challenge\n\n\nFollow ESPN\n\n\n\n\nFacebook\n\n\n\n\n\n\n\nX/Twitter\n\n\n\n\n\n\n\nInstagram\n\n\n\n\n\n\n\nSnapchat\n\n\n\n\n\n\n\nTikTok\n\n\n\n\n\n\n\nYouTube\n\n\nCollege football's most entertaining conference? Why the 16-team Big 12 is wiiiiiide open this seasonLong known as one of the sport's most unpredictable conferences, the new-look Big 12 promises another dose of chaos.11hBill ConnellyScott Winters/Icon SportswireUSC, Oregon and the quest to bulk up for the Big TenTo improve on D, the Trojans wanted to bulk up for a new league. They're not the only team trying to do that.10hAdam RittenbergThe 30 teams that can reach the CFPConnelly's best games of the 2024 seasonTOP HEADLINESTeam USA sets world record in 4x400 mixed relayGermany beats France, undefeated in men's hoopsU.S. men's soccer exits Games after Morocco routHungary to protest Khelif's Olympic participationKobe's Staples Center locker sells for record $2.9MDjokovic, Alcaraz to meet again, this time for goldKerr: Team USA lineups based on players' rolesMarchand wins 200m IM; McEvoy takes 50 freeScouting Shedeur Sanders' NFL futureLATEST FROM PARISBreakout stars, best moments and what comes next: Breaking down the Games halfway throughAt the midpoint of the Olympics, we look back at some of the best moments and forward at what's still to come in the second week.35mESPNMustafa Yalcin/Anadolu via Getty ImagesThe numbers behind USA's world record in 4x400 mixed relay4h0:46Medal trackerFull resultsFull coverage of the OlympicsPRESEASON HAS BEGUN!New kickoff rules on display to start Hall of Fame Game19h0:41McAfee on NFL's new kickoff: It looks like a practice drill6h1:11NFL's new kickoff rules debut to mixed reviewsTexans-Bears attracts more bets than MLBTOP RANK BOXINGSATURDAY ON ESPN+ PPVWhy Terence Crawford is playing the long game for a chance to face CaneloCrawford is approaching Saturday's marquee matchup against Israil Madrimov with his sights set on landing a bigger one next: against Canelo Alvarez.10hMike CoppingerMark Robinson/Matchroom BoxingBradley's take: Crawford's power vs. Israil Madrimov's disciplined styleTimothy Bradley Jr. breaks down the junior middleweight title fight.2dTimothy Bradley Jr.Buy Crawford vs. Madrimov on ESPN+ PPVChance to impress for Madrimov -- and UzbekistanHOW FRIDAY WENTMORE FROM THE PARIS OLYMPICSGrant Fisher makes U.S. track history, Marchand wins 4th gold and more Friday at the Paris GamesSha'Carri Richardson made her long-awaited Olympic debut during the women's 100m preliminary round on Friday. Here's everything else you might have missed from Paris.27mESPNGetty ImagesU.S. men's loss to Morocco is a wake-up call before World CupOutclassed by Morocco, the U.S. men's Olympic team can take plenty of lessons with the World Cup on the horizon.4hSam BordenFull coverage of the OlympicsOLYMPIC MEN'S HOOPS SCOREBOARDFRIDAY'S GAMESOLYMPIC STANDOUTSWhy Simone Biles is now Stephen A.'s No. 1 Olympian7h0:58Alcaraz on the cusp of history after securing spot in gold medal match8h0:59Simone Biles' gymnastics titles: Olympics, Worlds, more statsOLYMPIC MEN'S SOCCER SCOREBOARDFRIDAY'S GAMESTRADE DEADLINE FALLOUTOlney: Eight big questions for traded MLB playersCan Jazz Chisholm Jr. handle New York? Is Jack Flaherty healthy? Will Jorge Soler's defense play? Key questions for players in new places.10hBuster OlneyWinslow Townson/Getty ImagesRanking the top prospects who changed teams at the MLB trade deadlineYou know the major leaguers who moved by now -- but what about the potential stars of tomorrow?1dKiley McDanielMLB Power RankingsSeries odds: Dodgers still on top; Phillies, Yanks behind them Top HeadlinesTeam USA sets world record in 4x400 mixed relayGermany beats France, undefeated in men's hoopsU.S. men's soccer exits Games after Morocco routHungary to protest Khelif's Olympic participationKobe's Staples Center locker sells for record $2.9MDjokovic, Alcaraz to meet again, this time for goldKerr: Team USA lineups based on players' rolesMarchand wins 200m IM; McEvoy takes 50 freeScouting Shedeur Sanders' NFL futureFavorites FantasyManage FavoritesFantasy HomeCustomize ESPNCreate AccountLog InICYMI0:47Nelson Palacio rips an incredible goal from outside the boxNelson Palacio scores an outside-of-the-box goal for Real Salt Lake in the 79th minute. \n\n\nMedal Tracker\n\n\n\nCountries\nAthletes\n\nOverall Medal Leaders43USA36FRA31CHNIndividual Medal LeadersGoldCHN 13FRA 11AUS 11SilverUSA 18FRA 12GBR 10BronzeUSA 16FRA 13CHN 9Overall Medal Leaders4MarchandMarchand3O'CallaghanO'Callaghan3McIntoshMcIntoshIndividual Medal LeadersGoldMarchand 4O'Callaghan 3McIntosh 2SilverSmith 3Huske 2Walsh 2BronzeYufei 3Bhaker 2Haughey 2\n\n\nFull Medal Tracker\n\n\nBest of ESPN+ESPNCollege Football Playoff 2024: 30 teams can reach postseasonHeather Dinich analyzes the teams with at least a 10% chance to make the CFP.AP Photo/Ross D. FranklinNFL Hall of Fame predictions: Who will make the next 10 classes?When will Richard Sherman and Marshawn Lynch make it? Who could join Aaron Donald in 2029? Let's map out each Hall of Fame class until 2034.Thearon W. Henderson/Getty ImagesMLB trade deadline 2024: Ranking prospects who changed teamsYou know the major leaguers who moved by now -- but what about the potential stars of tomorrow who went the other way in those deals? Trending NowIllustration by ESPNRanking the top 100 professional athletes since 2000Who tops our list of the top athletes since 2000? We're unveiling the top 25, including our voters' pick for the No. 1 spot.Photo by Kevin C. Cox/Getty Images2024 NFL offseason recap: Signings, coach moves, new rulesThink you missed something in the NFL offseason? We've got you covered with everything important that has happened since February.Stacy Revere/Getty ImagesTop 25 college football stadiums: Rose Bowl, Michigan and moreFourteen of ESPN's college football writers rank the 25 best stadiums in the sport. Who's No. 1, who missed the cut and what makes these stadiums so special?ESPNInside Nate Robinson's silent battle -- and his fight to liveFor nearly 20 years Nate Robinson has been fighting a silent battle -- one he didn't realize until recently could end his life. Sign up to play the #1 Fantasy game!Create A LeagueJoin Public LeagueReactivate A LeagueMock Draft NowSign up for FREE!Create A LeagueJoin a Public LeagueReactivate a LeaguePractice With a Mock DraftSign up for FREE!Create A LeagueJoin a Public LeagueReactivate a LeaguePractice with a Mock DraftGet a custom ESPN experienceEnjoy the benefits of a personalized accountSelect your favorite leagues, teams and players and get the latest scores, news and updates that matter most to you. \n\nESPN+\n\n\n\n\nBoxing: Crawford vs. Madrimov (ESPN+ PPV)\n\n\n\n\n\n\n\nPFL Playoffs: Heavyweights & Women's Flyweights\n\n\n\n\n\n\n\nMLB\n\n\n\n\n\n\n\nLittle League Baseball: Regionals\n\n\n\n\n\n\n\nIn The Arena: Serena Williams\n\n\n\n\n\n\n\nThe 30 College Football Playoff Contenders\n\n\nQuick Links\n\n\n\n\n2024 Paris Olympics\n\n\n\n\n\n\n\nOlympics: Everything to Know\n\n\n\n\n\n\n\nMLB Standings\n\n\n\n\n\n\n\nSign up: Fantasy Football\n\n\n\n\n\n\n\nWNBA Rookie Tracker\n\n\n\n\n\n\n\nNBA Free Agency Buzz\n\n\n\n\n\n\n\nLittle League Baseball, Softball\n\n\n\n\n\n\n\nESPN Radio: Listen Live\n\n\n\n\n\n\n\nWatch Golf on ESPN\n\n\nFantasy\n\n\n\n\nFootball\n\n\n\n\n\n\n\nBaseball\n\n\n\n\n\n\n\nBasketball\n\n\n\n\n\n\n\nHockey\n\n\nESPN Sites\n\n\n\n\nESPN Deportes\n\n\n\n\n\n\n\nAndscape\n\n\n\n\n\n\n\nespnW\n\n\n\n\n\n\n\nESPNFC\n\n\n\n\n\n\n\nX Games\n\n\n\n\n\n\n\nSEC Network\n\n\nESPN Apps\n\n\n\n\nESPN\n\n\n\n\n\n\n\nESPN Fantasy\n\n\n\n\n\n\n\nTournament Challenge\n\n\nFollow ESPN\n\n\n\n\nFacebook\n\n\n\n\n\n\n\nX/Twitter\n\n\n\n\n\n\n\nInstagram\n\n\n\n\n\n\n\nSnapchat\n\n\n\n\n\n\n\nTikTok\n\n\n\n\n\n\n\nYouTube\n\n\nTerms of UsePrivacy PolicyYour US State Privacy RightsChildren's Online Privacy PolicyInterest-Based AdsAbout Nielsen MeasurementDo Not Sell or Share My Personal InformationContact UsDisney Ad Sales SiteWork for ESPNCorrectionsESPN BET is owned and operated by PENN Entertainment, Inc. and its subsidiaries ('PENN'). ESPN BET is available in states where PENN is licensed to offer sports wagering. Must be 21+ to wager. If you or someone you know has a gambling problem and wants help, call 1-800-GAMBLER.Copyright: © 2024 ESPN Enterprises, Inc. All rights reserved.\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
```



```python
print(docs[0].metadata)
```
```output
{'source': 'https://www.espn.com/', 'title': 'ESPN - Serving Sports Fans. Anytime. Anywhere.', 'description': 'Visit ESPN for live scores, highlights and sports news. Stream exclusive games on ESPN+ and play fantasy sports.', 'language': 'en'}
```
### 并发加载多个网址

您可以通过并发抓取和解析多个网址来加快抓取过程。

并发请求有合理的限制，默认每秒2个。如果您不担心做一个好公民，或者您控制着您正在抓取的服务器并且不在乎负载，您可以更改`requests_per_second`参数以增加最大并发请求。请注意，虽然这会加快抓取过程，但可能会导致服务器阻止您。请小心！


```python
%pip install -qU  nest_asyncio

# fixes a bug with asyncio and jupyter
import nest_asyncio

nest_asyncio.apply()
```
```output
Requirement already satisfied: nest_asyncio in /Users/harrisonchase/.pyenv/versions/3.9.1/envs/langchain/lib/python3.9/site-packages (1.5.6)
```

```python
loader = WebBaseLoader(["https://www.espn.com/", "https://google.com"])
loader.requests_per_second = 1
docs = loader.aload()
docs
```



```output
[Document(page_content="\n\n\n\n\n\n\n\n\nESPN - Serving Sports Fans. Anytime. Anywhere.\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n        Skip to main content\n    \n\n        Skip to navigation\n    \n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n<\n\n>\n\n\n\n\n\n\n\n\n\nMenuESPN\n\n\nSearch\n\n\n\nscores\n\n\n\nNFLNBANCAAMNCAAWNHLSoccer…MLBNCAAFGolfTennisSports BettingBoxingCFLNCAACricketF1HorseLLWSMMANASCARNBA G LeagueOlympic SportsRacingRN BBRN FBRugbyWNBAWorld Baseball ClassicWWEX GamesXFLMore ESPNFantasyListenWatchESPN+\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n  \n\nSUBSCRIBE NOW\n\n\n\n\n\nNHL: Select Games\n\n\n\n\n\n\n\nXFL\n\n\n\n\n\n\n\nMLB: Select Games\n\n\n\n\n\n\n\nNCAA Baseball\n\n\n\n\n\n\n\nNCAA Softball\n\n\n\n\n\n\n\nCricket: Select Matches\n\n\n\n\n\n\n\nMel Kiper's NFL Mock Draft 3.0\n\n\nQuick Links\n\n\n\n\nMen's Tournament Challenge\n\n\n\n\n\n\n\nWomen's Tournament Challenge\n\n\n\n\n\n\n\nNFL Draft Order\n\n\n\n\n\n\n\nHow To Watch NHL Games\n\n\n\n\n\n\n\nFantasy Baseball: Sign Up\n\n\n\n\n\n\n\nHow To Watch PGA TOUR\n\n\n\n\n\n\nFavorites\n\n\n\n\n\n\n      Manage Favorites\n      \n\n\n\nCustomize ESPNSign UpLog InESPN Sites\n\n\n\n\nESPN Deportes\n\n\n\n\n\n\n\nAndscape\n\n\n\n\n\n\n\nespnW\n\n\n\n\n\n\n\nESPNFC\n\n\n\n\n\n\n\nX Games\n\n\n\n\n\n\n\nSEC Network\n\n\nESPN Apps\n\n\n\n\nESPN\n\n\n\n\n\n\n\nESPN Fantasy\n\n\nFollow ESPN\n\n\n\n\nFacebook\n\n\n\n\n\n\n\nTwitter\n\n\n\n\n\n\n\nInstagram\n\n\n\n\n\n\n\nSnapchat\n\n\n\n\n\n\n\nYouTube\n\n\n\n\n\n\n\nThe ESPN Daily Podcast\n\n\nAre you ready for Opening Day? Here's your guide to MLB's offseason chaosWait, Jacob deGrom is on the Rangers now? Xander Bogaerts and Trea Turner signed where? And what about Carlos Correa? Yeah, you're going to need to read up before Opening Day.12hESPNIllustration by ESPNEverything you missed in the MLB offseason3h2:33World Series odds, win totals, props for every teamPlay fantasy baseball for free!TOP HEADLINESQB Jackson has requested trade from RavensSources: Texas hiring Terry as full-time coachJets GM: No rush on Rodgers; Lamar not optionLove to leave North Carolina, enter transfer portalBelichick to angsty Pats fans: See last 25 yearsEmbiid out, Harden due back vs. Jokic, NuggetsLynch: Purdy 'earned the right' to start for NinersMan Utd, Wrexham plan July friendly in San DiegoOn paper, Padres overtake DodgersLAMAR WANTS OUT OF BALTIMOREMarcus Spears identifies the two teams that need Lamar Jackson the most7h2:00Would Lamar sit out? Will Ravens draft a QB? Jackson trade request insightsLamar Jackson has asked Baltimore to trade him, but Ravens coach John Harbaugh hopes the QB will be back.3hJamison HensleyBallard, Colts will consider trading for QB JacksonJackson to Indy? Washington? Barnwell ranks the QB's trade fitsSNYDER'S TUMULTUOUS 24-YEAR RUNHow Washington’s NFL franchise sank on and off the field under owner Dan SnyderSnyder purchased one of the NFL's marquee franchises in 1999. Twenty-four years later, and with the team up for sale, he leaves a legacy of on-field futility and off-field scandal.13hJohn KeimESPNIOWA STAR STEPS UP AGAINJ-Will: Caitlin Clark is the biggest brand in college sports right now8h0:47'The better the opponent, the better she plays': Clark draws comparisons to TaurasiCaitlin Clark's performance on Sunday had longtime observers going back decades to find comparisons.16hKevin PeltonWOMEN'S ELITE EIGHT SCOREBOARDMONDAY'S GAMESCheck your bracket!NBA DRAFTHow top prospects fared on the road to the Final FourThe 2023 NCAA tournament is down to four teams, and ESPN's Jonathan Givony recaps the players who saw their NBA draft stock change.11hJonathan GivonyAndy Lyons/Getty ImagesTALKING BASKETBALLWhy AD needs to be more assertive with LeBron on the court9h1:33Why Perk won't blame Kyrie for Mavs' woes8h1:48WHERE EVERY TEAM STANDSNew NFL Power Rankings: Post-free-agency 1-32 poll, plus underrated offseason movesThe free agent frenzy has come and gone. Which teams have improved their 2023 outlook, and which teams have taken a hit?12hNFL Nation reportersIllustration by ESPNTHE BUCK STOPS WITH BELICHICKBruschi: Fair to criticize Bill Belichick for Patriots' struggles10h1:27 Top HeadlinesQB Jackson has requested trade from RavensSources: Texas hiring Terry as full-time coachJets GM: No rush on Rodgers; Lamar not optionLove to leave North Carolina, enter transfer portalBelichick to angsty Pats fans: See last 25 yearsEmbiid out, Harden due back vs. Jokic, NuggetsLynch: Purdy 'earned the right' to start for NinersMan Utd, Wrexham plan July friendly in San DiegoOn paper, Padres overtake DodgersFavorites FantasyManage FavoritesFantasy HomeCustomize ESPNSign UpLog InMarch Madness LiveESPNMarch Madness LiveWatch every men's NCAA tournament game live! ICYMI1:42Austin Peay's coach, pitcher and catcher all ejected after retaliation pitchAustin Peay's pitcher, catcher and coach were all ejected after a pitch was thrown at Liberty's Nathan Keeter, who earlier in the game hit a home run and celebrated while running down the third-base line. Men's Tournament ChallengeIllustration by ESPNMen's Tournament ChallengeCheck your bracket(s) in the 2023 Men's Tournament Challenge, which you can follow throughout the Big Dance. Women's Tournament ChallengeIllustration by ESPNWomen's Tournament ChallengeCheck your bracket(s) in the 2023 Women's Tournament Challenge, which you can follow throughout the Big Dance. Best of ESPN+AP Photo/Lynne SladkyFantasy Baseball ESPN+ Cheat Sheet: Sleepers, busts, rookies and closersYou've read their names all preseason long, it'd be a shame to forget them on draft day. The ESPN+ Cheat Sheet is one way to make sure that doesn't happen.Steph Chambers/Getty ImagesPassan's 2023 MLB season preview: Bold predictions and moreOpening Day is just over a week away -- and Jeff Passan has everything you need to know covered from every possible angle.Photo by Bob Kupbens/Icon Sportswire2023 NFL free agency: Best team fits for unsigned playersWhere could Ezekiel Elliott land? Let's match remaining free agents to teams and find fits for two trade candidates.Illustration by ESPN2023 NFL mock draft: Mel Kiper's first-round pick predictionsMel Kiper Jr. makes his predictions for Round 1 of the NFL draft, including projecting a trade in the top five. Trending NowAnne-Marie Sorvin-USA TODAY SBoston Bruins record tracker: Wins, points, milestonesThe B's are on pace for NHL records in wins and points, along with some individual superlatives as well. Follow along here with our updated tracker.Mandatory Credit: William Purnell-USA TODAY Sports2023 NFL full draft order: AFC, NFC team picks for all roundsStarting with the Carolina Panthers at No. 1 overall, here's the entire 2023 NFL draft broken down round by round. How to Watch on ESPN+Gregory Fisher/Icon Sportswire2023 NCAA men's hockey: Results, bracket, how to watchThe matchups in Tampa promise to be thrillers, featuring plenty of star power, high-octane offense and stellar defense.(AP Photo/Koji Sasahara, File)How to watch the PGA Tour, Masters, PGA Championship and FedEx Cup playoffs on ESPN, ESPN+Here's everything you need to know about how to watch the PGA Tour, Masters, PGA Championship and FedEx Cup playoffs on ESPN and ESPN+.Hailie Lynch/XFLHow to watch the XFL: 2023 schedule, teams, players, news, moreEvery XFL game will be streamed on ESPN+. Find out when and where else you can watch the eight teams compete. Sign up to play the #1 Fantasy Baseball GameReactivate A LeagueCreate A LeagueJoin a Public LeaguePractice With a Mock DraftSports BettingAP Photo/Mike KropfMarch Madness betting 2023: Bracket odds, lines, tips, moreThe 2023 NCAA tournament brackets have finally been released, and we have everything you need to know to make a bet on all of the March Madness games. Sign up to play the #1 Fantasy game!Create A LeagueJoin Public LeagueReactivateMock Draft Now\n\nESPN+\n\n\n\n\nNHL: Select Games\n\n\n\n\n\n\n\nXFL\n\n\n\n\n\n\n\nMLB: Select Games\n\n\n\n\n\n\n\nNCAA Baseball\n\n\n\n\n\n\n\nNCAA Softball\n\n\n\n\n\n\n\nCricket: Select Matches\n\n\n\n\n\n\n\nMel Kiper's NFL Mock Draft 3.0\n\n\nQuick Links\n\n\n\n\nMen's Tournament Challenge\n\n\n\n\n\n\n\nWomen's Tournament Challenge\n\n\n\n\n\n\n\nNFL Draft Order\n\n\n\n\n\n\n\nHow To Watch NHL Games\n\n\n\n\n\n\n\nFantasy Baseball: Sign Up\n\n\n\n\n\n\n\nHow To Watch PGA TOUR\n\n\nESPN Sites\n\n\n\n\nESPN Deportes\n\n\n\n\n\n\n\nAndscape\n\n\n\n\n\n\n\nespnW\n\n\n\n\n\n\n\nESPNFC\n\n\n\n\n\n\n\nX Games\n\n\n\n\n\n\n\nSEC Network\n\n\nESPN Apps\n\n\n\n\nESPN\n\n\n\n\n\n\n\nESPN Fantasy\n\n\nFollow ESPN\n\n\n\n\nFacebook\n\n\n\n\n\n\n\nTwitter\n\n\n\n\n\n\n\nInstagram\n\n\n\n\n\n\n\nSnapchat\n\n\n\n\n\n\n\nYouTube\n\n\n\n\n\n\n\nThe ESPN Daily Podcast\n\n\nTerms of UsePrivacy PolicyYour US State Privacy RightsChildren's Online Privacy PolicyInterest-Based AdsAbout Nielsen MeasurementDo Not Sell or Share My Personal InformationContact UsDisney Ad Sales SiteWork for ESPNCopyright: © ESPN Enterprises, Inc. All rights reserved.\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", lookup_str='', metadata={'source': 'https://www.espn.com/'}, lookup_index=0),
 Document(page_content='GoogleSearch Images Maps Play YouTube News Gmail Drive More »Web History | Settings | Sign in\xa0Advanced searchAdvertisingBusiness SolutionsAbout Google© 2023 - Privacy - Terms   ', lookup_str='', metadata={'source': 'https://google.com'}, lookup_index=0)]
```


### 加载 XML 文件，或使用不同的 BeautifulSoup 解析器

您还可以查看 `SitemapLoader`，了解如何加载网站地图文件的示例，这也是使用此功能的一个示例。


```python
loader = WebBaseLoader(
    "https://www.govinfo.gov/content/pkg/CFR-2018-title10-vol3/xml/CFR-2018-title10-vol3-sec431-86.xml"
)
loader.default_parser = "xml"
docs = loader.load()
docs
```



```output
[Document(page_content='\n\n10\nEnergy\n3\n2018-01-01\n2018-01-01\nfalse\nUniform test method for the measurement of energy efficiency of commercial packaged boilers.\nÂ§ 431.86\nSection Â§ 431.86\n\nEnergy\nDEPARTMENT OF ENERGY\nENERGY CONSERVATION\nENERGY EFFICIENCY PROGRAM FOR CERTAIN COMMERCIAL AND INDUSTRIAL EQUIPMENT\nCommercial Packaged Boilers\nTest Procedures\n\n\n\n\n§\u2009431.86\nUniform test method for the measurement of energy efficiency of commercial packaged boilers.\n(a) Scope. This section provides test procedures, pursuant to the Energy Policy and Conservation Act (EPCA), as amended, which must be followed for measuring the combustion efficiency and/or thermal efficiency of a gas- or oil-fired commercial packaged boiler.\n(b) Testing and Calculations. Determine the thermal efficiency or combustion efficiency of commercial packaged boilers by conducting the appropriate test procedure(s) indicated in Table 1 of this section.\n\nTable 1—Test Requirements for Commercial Packaged Boiler Equipment Classes\n\nEquipment category\nSubcategory\nCertified rated inputBtu/h\n\nStandards efficiency metric(§\u2009431.87)\n\nTest procedure(corresponding to\nstandards efficiency\nmetric required\nby §\u2009431.87)\n\n\n\nHot Water\nGas-fired\n≥300,000 and ≤2,500,000\nThermal Efficiency\nAppendix A, Section 2.\n\n\nHot Water\nGas-fired\n>2,500,000\nCombustion Efficiency\nAppendix A, Section 3.\n\n\nHot Water\nOil-fired\n≥300,000 and ≤2,500,000\nThermal Efficiency\nAppendix A, Section 2.\n\n\nHot Water\nOil-fired\n>2,500,000\nCombustion Efficiency\nAppendix A, Section 3.\n\n\nSteam\nGas-fired (all*)\n≥300,000 and ≤2,500,000\nThermal Efficiency\nAppendix A, Section 2.\n\n\nSteam\nGas-fired (all*)\n>2,500,000 and ≤5,000,000\nThermal Efficiency\nAppendix A, Section 2.\n\n\n\u2003\n\n>5,000,000\nThermal Efficiency\nAppendix A, Section 2.OR\nAppendix A, Section 3 with Section 2.4.3.2.\n\n\n\nSteam\nOil-fired\n≥300,000 and ≤2,500,000\nThermal Efficiency\nAppendix A, Section 2.\n\n\nSteam\nOil-fired\n>2,500,000 and ≤5,000,000\nThermal Efficiency\nAppendix A, Section 2.\n\n\n\u2003\n\n>5,000,000\nThermal Efficiency\nAppendix A, Section 2.OR\nAppendix A, Section 3. with Section 2.4.3.2.\n\n\n\n*\u2009Equipment classes for commercial packaged boilers as of July 22, 2009 (74 FR 36355) distinguish between gas-fired natural draft and all other gas-fired (except natural draft).\n\n(c) Field Tests. The field test provisions of appendix A may be used only to test a unit of commercial packaged boiler with rated input greater than 5,000,000 Btu/h.\n[81 FR 89305, Dec. 9, 2016]\n\n\nEnergy Efficiency Standards\n\n', lookup_str='', metadata={'source': 'https://www.govinfo.gov/content/pkg/CFR-2018-title10-vol3/xml/CFR-2018-title10-vol3-sec431-86.xml'}, lookup_index=0)]
```


## 懒加载

您可以使用懒加载一次只加载一页，以最小化内存需求。


```python
pages = []
for doc in loader.lazy_load():
    pages.append(doc)

print(pages[0].page_content[:100])
print(pages[0].metadata)
```
```output









ESPN - Serving Sports Fans. Anytime. Anywhere.













































{'source': 'https://www.espn.com/', 'title': 'ESPN - Serving Sports Fans. Anytime. Anywhere.', 'description': 'Visit ESPN for live scores, highlights and sports news. Stream exclusive games on ESPN+ and play fantasy sports.', 'language': 'en'}
```
## 使用代理

有时您可能需要使用代理来绕过 IP 阻止。您可以将代理字典传递给加载器（以及底层的 `requests`）以使用它们。


```python
loader = WebBaseLoader(
    "https://www.walmart.com/search?q=parrots",
    proxies={
        "http": "http://{username}:{password}:@proxy.service.com:6666/",
        "https": "https://{username}:{password}:@proxy.service.com:6666/",
    },
)
docs = loader.load()
```

## API 参考

有关所有 `WebBaseLoader` 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
