'use strict';
function cleanSeason(row){const season=Number(row?.season_number),count=Number(row?.episode_count);return Number.isInteger(season)&&season>=0&&Number.isInteger(count)&&count>0?{season,count}:null;}
function target(details,current,delta){
  if(!details||!Array.isArray(details.seasons)||!current||![-1,1].includes(Number(delta)))return null;
  const season=Number(current.season),episode=Number(current.episode);
  if(!Number.isInteger(season)||season<0||!Number.isInteger(episode)||episode<1)return null;
  let seasons=details.seasons.map(cleanSeason).filter(Boolean).sort((a,b)=>a.season-b.season);
  if(season!==0)seasons=seasons.filter(row=>row.season>0);
  const index=seasons.findIndex(row=>row.season===season);if(index<0)return null;
  const here=seasons[index];
  if(delta>0){if(episode<here.count)return {season,episode:episode+1};const next=seasons[index+1];return next?{season:next.season,episode:1}:null;}
  if(episode>1)return {season,episode:episode-1};const previous=seasons[index-1];return previous?{season:previous.season,episode:previous.count}:null;
}
module.exports={target};
