//to be used on pages for bluuarc.github.io

//print code requried at header of every page
function printHeader(activeTab){
  //var header = document.getElementById("header-page");
  document.write('<!--Begin Header Code-->');

  //print top nav stuff
  document.write('<nav class="navbar navbar-inverse navbar-fixed-top"> \
      <div class="container"> \
        <div class="navbar-header"> \
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar"> \
            <span class="sr-only">Toggle navigation</span> \
            <span class="icon-bar"></span> \
            <span class="icon-bar"></span> \
            <span class="icon-bar"></span> \
          </button> \
          <a class="navbar-brand" href="http://bluuarc.github.io" title="Joshua Castor\'s Code Compendium">JCCC</a> \
        </div> \
        <div id="navbar" class="collapse navbar-collapse"> \
          <ul class="nav navbar-nav"> ');

  //print links
  var list = [
      "Projects", "./home.html",
      "About", "./about.html",
      "Contact", "./contact.html"
  ]

  var i = 0;
  for(i = 0; i < list.length; i = i + 2){
    if(activeTab == list[i])
      document.write('<li class="active"><a href="' + list[i+1] + '">' + list[i] + '</a></li>');
    else
      document.write('<li><a href="' + list[i+1] + '">' + list[i] + '</a></li>');
  }
  //print closing tags
  document.write('</ul></div><!--/.nav-collapse --></div></nav>');

  document.write('<!--End Header Code-->');
}

//print code required at footer of every page
function printFooter(){
  //var footer = document.getElementById("footer-page");
  document.write('<!--Begin Footer Code-->');

  //print Bootstrap
  document.write('<!-- Bootstrap core JavaScript \
    ================================================== --> \
    <!-- Placed at the end of the document so the pages load faster --> \
    <!-- jQuery (necessary for Bootstrap\'s JavaScript plugins) --> \
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script> \
    <!-- Include all compiled plugins (below), or include individual files as needed --> \
    <script src="js/bootstrap.min.js"></script> \
    <!-- IE10 viewport hack for Surface/desktop Windows 8 bug --> \
    <script src="js/ie10-viewport-bug-workaround.js"></script>');

  //print StatCounter
  document.write('<!-- Start of StatCounter Code for Default Guide --> \
    <script type="text/javascript"> \
    var sc_project=11034084; \
    var sc_invisible=1; \
    var sc_security="3e7dba9f"; \
    var scJsHost = (("https:" == document.location.protocol) ? \
    "https://secure." : "http://www."); \
    document.write("<sc"+"ript type=\'text/javascript\' src=\'" + \
    scJsHost+ \
    "statcounter.com/counter/counter.js\'></"+"script>"); \
    </script> \
    <noscript><div class="statcounter"><a title="shopify site \
    analytics" href="http://statcounter.com/shopify/" \
    target="_blank"><img class="statcounter" \
    src="//c.statcounter.com/11034084/0/3e7dba9f/1/" \
    alt="shopify site analytics"></a></div></noscript> \
    <!-- End of StatCounter Code for Default Guide -->');

  document.write('<!--End Footer Code-->');
}

function printFormattedLinks(list){
  var i = 0;

  for(i = 0; i < list.length; i = i + 3){
    document.write('<div class="boxed-content-sub"><h4><a href="' + list[i+1] + '">' + list[i] + "</a></h4>");
    document.write("<p>" + list[i+2]+"</p></div><br>");
  }
}
