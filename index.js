import React, {Component, PropTypes} from 'react';

// pull hash from url
// window.location.hash.split('/')[1]

const jQuery = window['$'];
const station = window.location.hostname.toLowerCase() === 'www.news9.com' ? 'kwtv' : 'kotv';
const h2style = { 
  fontWeight: 300, 
  fontSize: '33.07px', 
  color: '#111'
};
const ftpURL = 'http://ftpcontent.worldnow.com/kotv/custom/weather/radar/';
const awsURL = 'http://aws.kotv.com/MorHtml5/kotv/';
const validRadars = {
  neok: 'neok', 
  nwok: 'nwok',
  seok: 'seok',
  swok: 'swok',
  okc: 'okc40', 
  scok: 'scok', 
  ncok: 'ncok', 
  tulsa: 'tulsa40', 
  mcal: 'mcal40', 
  musk: 'musk40', 
  bart: 'bart40', 
  grand: 'grand40', 
  centralok: 'centralok'
};

const mordiv = {
  width:'100%'
};

const dateTime = (new Date()).getTime();

let mainRadarVisibility = '';
let specificRadarVisibility = 'hidden';
let isSpecific = false;


class WarnEspRadar extends Component {
  constructor(props){
    super(props);

    let curHash = window.location.hash;
    let specRadar;
    if(curHash.length){
      let specificRadar = curHash.split('/')[1];
      if(validRadars.hasOwnProperty(specificRadar) > -1){
        isSpecific = true;
        mainRadarVisibility = 'hidden';
        specificRadarVisibility = '';
        specRadar = specificRadar;
      }
    }

    this.state = {
      radarName: station === 'kotv' ? 'WARN' : 'ESP',
      currentRadar: isSpecific ? specRadar : 'main',
      hasResized: false,
      mapWidth: 960,
      hasSetupControls: false
    };
  }

  gotoMain = (e) => {
    //e.preventDefault();
    //window.location.hash = '';
    jQuery('#MORdivcan').html('');
    jQuery('.mainRadarContainer').removeClass('hidden');
    jQuery('#mapContainer').addClass('hidden');
  }

  resizeAreas = (e) => {
    let mainContain = document.getElementsByClassName('mainRadarContainer')[0];
    let mWidth = mainContain.offsetWidth;
    if(this.state.mapWidth !== mWidth){
      //continue
      let areas = document.getElementById('radarMap').getElementsByTagName('area');
      let diff = mWidth / this.state.mapWidth;
      let coords = [];
      let i,j,k;
      for(i = 0; i < areas.length; i++){
        coords[i] = areas[i].coords.split(',');
      }
      for(j = 0; j < areas.length; j++){
        for(k = 0; k < coords[j].length; k++){
          coords[j][k] *= diff;
        }
        areas[j].coords = coords[j].join(',');
      }
      this.setState({
        mapWidth: mWidth
      });
    }
  }

  toggleOptions = (e) => {
    jQuery('#warnOptions').toggleClass('expanded');
  }

  activateControls = () => {
    if(!this.state.hasSetupControls){
      let mainArray = [['roads', 'Cities-Roads'],['roadLabels', 'Road Labels'],['cities', 'Counties']];
      let warnings = [['warnings', 'Warnings'],['tracks', 'Storm Track'],['hail', 'Hail'],['lightning', 'Lightning'],['rotation', 'Rotation'],['intenseRotation', 'TVS']];
      let legend = false, legendName;
      mainArray = mainArray.concat(warnings);
      //window.testArray = mainArray;

      function bottomLegend(legendtype){
        if(legendtype !== undefined){
          switch(legendtype){
            case 'type':
            jQuery('.legend-stp').hide(); jQuery('.legend-br1').hide(); jQuery('.legend-type').show();
            break;
            case 'stp':
            jQuery('.legend-type').hide(); jQuery('.legend-br1').hide(); jQuery('.legend-stp').show();
            break;
            default:
          }
        }
        else{
          jQuery('.legend-stp').hide();
          jQuery('.legend-type').hide();
          jQuery('.legend-br1').show();
        }
      }

      function showLegend(){
        //console.log('running showLegend');
        jQuery('.legend-icons').show();
      }

      function hideLegend(){
        //console.log('running hideLegend');
        jQuery('.legend-icons').hide();
      }

      for(let i = 0; i < mainArray.length; i++){
        (function(){ 
          let handler = mainArray[i][0];
          let receiver = mainArray[i][1];
          jQuery('#' + handler).change(function(){
            legend = false;
            let thisID = jQuery(this).attr('id');
            if(jQuery(this).is(':checked')){
              //console.log('checked true'); 
              jQuery('input[value="' + receiver + '"]').prop('checked', true); 
              if(thisID !== 'roads' && thisID !== 'roadLabels' && thisID !== 'cities'){
                legend = true; 
              }
            }
            else{ 
              jQuery('input[value="' + receiver + '"]').prop('checked', false);
              for(let j = 0; j < warnings.length; j++){
                let name = warnings[j][0];
                if(jQuery('#' + name).is(':checked')){
                  legend = true;
                }
              }
              
            }
            if(legend){ showLegend(); }
            else{ hideLegend(); }//console.log('legend is false'); 

          });
        })();
      }

      

      jQuery('input[name=radio]').change(function(){
        var currentEle = jQuery(this).attr('id');
        if(currentEle == 'rainfall'){ 
          bottomLegend('stp'); 
          jQuery('input[value=Rainfall]').click(); 
          jQuery('input[value=Winterize]').prop('checked', false); 
        }
        else if(currentEle == 'radar'){ 
          bottomLegend(); 
          jQuery('input[value=Radar]').click(); 
          jQuery('input[value=Winterize]').prop('checked', false); 
        }
        else if(currentEle == 'winterize'){ 
          bottomLegend('type'); 
          jQuery('input[value=Radar]').click(); 
          jQuery('input[value=Winterize]').prop('checked', true); 
        }
      });
      
      this.setState({
        hasSetupControls: true
      });
    }
  }

  setupMap = (map) => {
    if(!jQuery('.mainRadarContainer').hasClass('hidden')){ jQuery('.mainRadarContainer').addClass('hidden'); }
    if(jQuery('#mapContainer').hasClass('hidden')){ jQuery('#mapContainer').removeClass('hidden'); }
    jQuery('#MORdivcan').html('');
    MORAnimator.setup(validRadars[map]);
    jQuery('#gnmradarlist .active').removeClass('active');
    let specRadarLI = jQuery(`#gnmradarlist li[data-ref="${map}"]`);
    specRadarLI.addClass('active');
    specRadarLI.children().addClass('active');
    this.activateControls();
  }

  preSetup = (map) => {
    if(this.state.currentRadar !== map){ this.setupMap(map); }
  }

  componentDidMount(){
    //setup event listeners
    this.resizeAreas();
    jQuery('.mainRadarContainer').on('mouseenter', 'area', function(e){ 
      var rel = jQuery(e.currentTarget).attr('rel');
      jQuery(`#${rel}`).addClass('over');
    });
    jQuery('.mainRadarContainer').on('mouseleave', 'area', function(e){
      jQuery('.over').removeClass('over');
    });
    window.addEventListener('resize', this.resizeAreas);
    if(isSpecific){
      let specificRadar = window.location.hash.split('/')[1];
      this.setupMap(specificRadar);
      this.activateControls();
    }
    jQuery('#radarStrip').perfectScrollbar({ suppressScrollY: true });
  }

  render(){
    return (
      <div className="col-xs-12 warnespradar">
        <h2 style={h2style}>{this.state.radarName} Interactive Radar</h2>
        <div className="row">
          <div className="col-lg-8 col-xl-9">
            <div className={`mainRadarContainer ${mainRadarVisibility}`}>
              <div className="hotspots">
                <map name="radar" id="radarMap">
                  <area title="Northwest Oklahoma" rel="nwok" coords="113,10,113,260,465,258,465,215,491,216,491,9" shape="poly" href="#/nwok" onClick={(e) => { this.preSetup('nwok'); }} />
                  <area title="Oklahoma City" rel="central" coords="468,218,668,218,667,348,468,348" shape="poly" href="#/okc" onClick={(e) => { this.preSetup('okc'); }} />
                  <area title="Southwest Oklahoma" rel="swok" coords="146,262,145,480,479,480,479,350,466,343,466,261" shape="poly" href="#/swok" onClick={(e) => { this.preSetup('swok'); }} />
                  <area title="South Oklahoma" rel="scok" coords="482,349,481,490,667,491,668,350" shape="poly" href="#/scok" onClick={(e) => { this.preSetup('scok'); }} />
                  <area title="Southeast Oklahoma" rel="seok" coords="669,387,894,387,894,521,669,521" shape="poly" href="#/seok" onClick={(e) => { this.preSetup('seok'); }} />
                  <area title="McAlester" rel="mcal" coords="670,277,670,385,894,383,893,276" shape="poly" href="#/mcal" onClick={(e) => { this.preSetup('mcal'); }} />
                  <area title="Muskogee" rel="musk" coords="761,164,894,164,893,274,761,275" shape="poly" href="#/musk" onClick={(e) => { this.preSetup('musk'); }} />
                  <area title="Tulsa" rel="tulsa" coords="669,129,759,130,759,275,669,274" shape="poly" href="#/tulsa" onClick={(e) => { this.preSetup('tulsa'); }} />
                  <area title="Bartlesville" rel="bart" coords="669,127,758,127,758,10,669,11" shape="poly" href="#/bart" onClick={(e) => { this.preSetup('bart'); }} />
                  <area title="North Oklahoma" rel="ncok" coords="495,216,493,13,667,12,666,216" shape="poly" href="#/ncok" onClick={(e) => { this.preSetup('ncok'); }} />
                  <area title="Grand Lake" rel="grand" coords="760,10,760,162,894,162,894,10" shape="poly" href="#/grand" onClick={(e) => { this.preSetup('grand'); }} />
                </map>
                <img src={`${awsURL}comp/960x540/statewide_anim.gif?${dateTime}`} alt="Oklahoma Radar" id="composite" />
                <img id="nwok" src={`${ftpURL}new/hover_nwok.png?${dateTime}`} alt="nwok hover" className="hover" title="Northwest Oklahoma" />
                <img id="ncok" src={`${ftpURL}new/hover_ncok.png?${dateTime}`} alt="ncok hover" className="hover" title="North Oklahoma" />
                <img id="bart" src={`${ftpURL}new/hover_bart.png?${dateTime}`} alt="bart hover" className="hover" title="Bartlesville" />
                <img id="tulsa" src={`${ftpURL}new/hover_tulsa.png?${dateTime}`} alt="tulsa hover" className="hover" title="Tulsa" />
                <img id="musk" src={`${ftpURL}radar/new/hover_musk.png?${dateTime}`} alt="musk hover" className="hover" title="Muskogee" />
                <img id="central" src={`${ftpURL}new/hover_central.png?${dateTime}`} alt="central hover" className="hover" title="Oklahoma City" />
                <img id="swok" src={`${ftpURL}new/hover_swok.png?${dateTime}`} alt="swok hover" className="hover" title="Southwest Oklahoma" />
                <img id="mcal" src={`${ftpURL}new/hover_mcal.png?${dateTime}`} alt="mcal hover" className="hover" title="McAlester" />
                <img id="scok" src={`${ftpURL}new/hover_scok.png?${dateTime}`} alt="scok hover" className="hover" title="South Oklahoma" />
                <img id="seok" src={`${ftpURL}new/hover_seok.png?${dateTime}`} alt="seok hover" className="hover" title="Southeast Oklahoma" />
                <img id="grand" src={`${ftpURL}new/hover_grand.png?${dateTime}`} alt="grand hover" className="hover" title="Grand Lake" />
                <img src="http://ftpcontent.worldnow.com/kotv/radar/legend_warning.png" alt="warnings legend" className="warnings" />
                <img src="http://ftpcontent.worldnow.com/kotv/radar/legend_left.png" className="legend_left" />
                <img src="http://ftpcontent.worldnow.com/kotv/custom/bradydistrict/images/mapblocks/1.gif" useMap="#radar" alt="Oklahoma Radar" id="overlay" />
              </div>
            </div>
            <div id="mapContainer" className={specificRadarVisibility}>
              <div id="warnOptions">	
                <div id="mapTypes">
                  <h3>Map Type</h3>
                  <ul>
                    <li>
                      <input type="radio" name="radio" id="radar" defaultChecked={true}/>
                      <label htmlFor="radar"><span className="radar">Radar</span></label>
                    </li>
                    <li>
                      <input type="radio" name="radio" id="rainfall" />
                      <label htmlFor="rainfall"><span className="rainfall">Rainfall</span></label>
                    </li>
                    <li>					
                      <input type="radio" name="radio" id="winterize" />
                      <label htmlFor="winterize"><span className="winterize">Winterize</span></label>
                    </li>
                  </ul>
                </div>	
                <div id="mapDetails">
                  <h3>Map Details</h3>
                  <ul>
                    <li>
                      <input type="checkbox" name="slide" id="roads" defaultChecked={true} />
                      <label htmlFor="roads">
                        <span className="slider">
                          <span className="toggle"></span>
                        </span>
                        <span className="roads">Cities - Roads</span>
                      </label>
                    </li>
                    <li>
                      <input type="checkbox" name="slide" id="roadLabels" />
                      <label htmlFor="roadLabels">
                        <span className="slider">
                          <span className="toggle"></span>
                        </span>
                        <span className="roadLabels">Road Labels</span>
                      </label>
                    </li>
                    <li>					
                      <input type="checkbox" name="slide" id="cities" />
                      <label htmlFor="cities">
                        <span className="slider">
                          <span className="toggle"></span>
                        </span>
                        <span className="cities">Counties</span>
                      </label>
                    </li>
                  </ul>
                </div>
                <div id="severeWeather">
                  <h3>Severe Weather</h3>			
                  <ul>				
                    <li>
                      <input type="checkbox" name="slide" id="warnings" />
                      <label htmlFor="warnings">
                        <span className="slider">
                          <span className="toggle"></span>
                        </span>
                        <span className="warnings">Warnings</span>
                      </label>
                    </li>
                    <li>					
                      <input type="checkbox" name="slide" id="lightning" />
                      <label htmlFor="lightning">
                        <span className="slider">
                          <span className="toggle"></span>
                        </span>
                        <span className="lightning">Lightning</span>
                      </label>
                    </li>
                    <li>					
                      <input type="checkbox" name="slide" id="tracks" />
                      <label htmlFor="tracks">
                        <span className="slider">
                          <span className="toggle"></span>
                        </span>
                        <span className="tracks">Tracks</span>
                      </label>
                    </li>
                    <li>					
                      <input type="checkbox" name="slide" id="rotation" />
                      <label htmlFor="rotation">
                        <span className="slider">
                          <span className="toggle"></span>
                        </span>
                        <span className="rotation">Rotation</span>
                      </label>
                    </li>
                    <li>					
                      <input type="checkbox" name="slide" id="hail" />
                      <label htmlFor="hail">
                        <span className="slider">
                          <span className="toggle"></span>
                        </span>
                        <span className="hail">Hail</span>
                      </label>
                    </li>
                    <li>
                      <input type="checkbox" name="slide" id="intenseRotation" />
                      <label htmlFor="intenseRotation">
                        <span className="slider">
                          <span className="toggle"></span>
                        </span>
                        <span className="intenseRotation">Intense Rotation</span>
                      </label>
                    </li>
                  </ul>
                </div>
                <div id="option_tab" onClick={(e) => { this.toggleOptions(e); }}>
                  <i className="fa fa-caret-up"></i>
                  <i className="fa fa-caret-down"></i>
                </div>
              </div>
              <div id="MORdivcan" style={mordiv}></div>
              <div className="legends">
                <div className="lowerlegends">
                  <div className="left">
                    <img src="http://ftpcontent.worldnow.com/kotv/radar/legend_warning.png" alt="Warnings Legend" className="legend-warn visible" />
                  </div>
                  <div className="right">
                    <img src="http://ftpcontent.worldnow.com/kotv/radar/legend_br.png" alt="Base Reflectivity Legend" className="legend-br1 exclusive visible" />
                    <img src="http://ftpcontent.worldnow.com/kotv/radar/legend_type.png" alt="Precip Type Legend" className="legend-type exclusive" />
                    <img src="http://ftpcontent.worldnow.com/kotv/radar/legend_stp.png" alt="Estimated Rainfall Legend" className="legend-stp exclusive" />
                  </div>
                </div>
                <img src="http://ftpcontent.worldnow.com/kotv/radar/legend_icons.png" alt="Icons Legend" className="legend-icons" />
              </div>
            </div>
            <div id="radarStrip">
              <ul id="gnmradarlist">
                <li data-ref="main" className="active">
                  <a className="active" href="#/" onClick={(e) => { this.gotoMain(e); }}>
                    <img src={`${awsURL}ssite/200x150/statewide_anim.gif?${dateTime}`} width="110" height="62" />
                    <span className="title">Oklahoma State</span>
                  </a>
                </li>
                <li data-ref="tulsa">
                  <a href="#/tulsa" onClick={(e) => { this.preSetup('tulsa'); }}>
                    <img src={`${awsURL}ssite/110x62_new/tulsa_anim.gif?${dateTime}`} alt="thumbnail" />
                    <span className="title">Tulsa</span>
                  </a>
                </li>
                <li data-ref="bart">
                  <a href="#/bart" onClick={(e) => { this.preSetup('bart'); }}>
                    <img src={`${awsURL}ssite/110x62_new/bart_anim.gif?${dateTime}`} alt="thumbnail" />
                    <span className="title">Bartlesville</span>
                  </a>
                </li>
                <li data-ref="grand">
                  <a href="#/grand" onClick={(e) => { this.preSetup('grand'); }}>
                    <img src={`${awsURL}ssite/110x62_new/grand_anim.gif?${dateTime}`} alt="thumbnail" />
                    <span className="title">Grand Lake</span>
                  </a>
                </li>
                <li data-ref="musk">
                  <a href="#/musk" onClick={(e) => { this.preSetup('musk'); }}>
                    <img src={`${awsURL}ssite/110x62_new/musk_anim.gif?${dateTime}`} alt="thumbnail" />
                    <span className="title">Muskogee</span>
                  </a>
                </li>
                <li data-ref="mcal">
                  <a href="#/mcal"  onClick={(e) => { this.preSetup('mcal'); }}>
                    <img src={`${awsURL}ssite/110x62_new/mcal_anim.gif?${dateTime}`} alt="thumbnail" />
                    <span className="title">McAlester</span>
                  </a>
                </li>
                <li data-ref="neok">
                  <a href="#/neok" onClick={(e) => { this.preSetup('neok'); }}>
                    <img src={`${awsURL}ssite/110x62_new/neok_anim.gif?${dateTime}`} alt="thumbnail" />
                    <span className="title">NE Oklahoma</span>
                  </a>
                </li>
                <li data-ref="seok">
                  <a href="#/seok" onClick={(e) => { this.preSetup('seok'); }}>
                    <img src={`${awsURL}ssite/110x62_new/seok_anim.gif?${dateTime}`} alt="thumbnail" />
                    <span className="title">SE Oklahoma</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-4 col-xl-3">
            <div className="ad300x250 warn">
              <img src="http://ftpcontent.worldnow.com/kotv/test/wx/ad_warnesp.jpg" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default WarnEspRadar;
