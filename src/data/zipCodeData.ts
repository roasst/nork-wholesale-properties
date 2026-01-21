// ============================================
// Florida ZIP Code Database - Auto-fill city, state, county
// Compressed format: [city, county]
// ============================================

type ZipInfo = { city: string; state: string; county: string };
type ZipData = [string, string]; // [city, county]

// Florida ZIP codes - comprehensive coverage
const FL_ZIPS: Record<string, ZipData> = {
  // Miami-Dade County
  "33010": ["Hialeah", "Miami-Dade"], "33011": ["Hialeah", "Miami-Dade"], "33012": ["Hialeah", "Miami-Dade"],
  "33013": ["Hialeah", "Miami-Dade"], "33014": ["Miami Lakes", "Miami-Dade"], "33015": ["Miami Lakes", "Miami-Dade"],
  "33016": ["Hialeah", "Miami-Dade"], "33017": ["Hialeah", "Miami-Dade"], "33018": ["Hialeah", "Miami-Dade"],
  "33054": ["Opa Locka", "Miami-Dade"], "33055": ["Opa Locka", "Miami-Dade"], "33056": ["Miami Gardens", "Miami-Dade"],
  "33101": ["Miami", "Miami-Dade"], "33109": ["Miami Beach", "Miami-Dade"], "33122": ["Miami", "Miami-Dade"],
  "33125": ["Miami", "Miami-Dade"], "33126": ["Miami", "Miami-Dade"], "33127": ["Miami", "Miami-Dade"],
  "33128": ["Miami", "Miami-Dade"], "33129": ["Miami", "Miami-Dade"], "33130": ["Miami", "Miami-Dade"],
  "33131": ["Miami", "Miami-Dade"], "33132": ["Miami", "Miami-Dade"], "33133": ["Miami", "Miami-Dade"],
  "33134": ["Coral Gables", "Miami-Dade"], "33135": ["Miami", "Miami-Dade"], "33136": ["Miami", "Miami-Dade"],
  "33137": ["Miami", "Miami-Dade"], "33138": ["Miami", "Miami-Dade"], "33139": ["Miami Beach", "Miami-Dade"],
  "33140": ["Miami Beach", "Miami-Dade"], "33141": ["Miami Beach", "Miami-Dade"], "33142": ["Miami", "Miami-Dade"],
  "33143": ["Miami", "Miami-Dade"], "33144": ["Miami", "Miami-Dade"], "33145": ["Miami", "Miami-Dade"],
  "33146": ["Coral Gables", "Miami-Dade"], "33147": ["Miami", "Miami-Dade"], "33149": ["Key Biscayne", "Miami-Dade"],
  "33150": ["Miami", "Miami-Dade"], "33154": ["Bal Harbour", "Miami-Dade"], "33155": ["Miami", "Miami-Dade"],
  "33156": ["Miami", "Miami-Dade"], "33157": ["Miami", "Miami-Dade"], "33158": ["Miami", "Miami-Dade"],
  "33160": ["North Miami Beach", "Miami-Dade"], "33161": ["North Miami", "Miami-Dade"], "33162": ["North Miami Beach", "Miami-Dade"],
  "33165": ["Miami", "Miami-Dade"], "33166": ["Miami", "Miami-Dade"], "33167": ["Miami", "Miami-Dade"],
  "33168": ["Miami", "Miami-Dade"], "33169": ["Miami Gardens", "Miami-Dade"], "33170": ["Miami", "Miami-Dade"],
  "33172": ["Miami", "Miami-Dade"], "33173": ["Miami", "Miami-Dade"], "33174": ["Miami", "Miami-Dade"],
  "33175": ["Miami", "Miami-Dade"], "33176": ["Miami", "Miami-Dade"], "33177": ["Miami", "Miami-Dade"],
  "33178": ["Miami", "Miami-Dade"], "33179": ["Miami", "Miami-Dade"], "33180": ["Miami", "Miami-Dade"],
  "33181": ["North Miami", "Miami-Dade"], "33182": ["Miami", "Miami-Dade"], "33183": ["Miami", "Miami-Dade"],
  "33184": ["Miami", "Miami-Dade"], "33185": ["Miami", "Miami-Dade"], "33186": ["Miami", "Miami-Dade"],
  "33187": ["Miami", "Miami-Dade"], "33189": ["Miami", "Miami-Dade"], "33190": ["Miami", "Miami-Dade"],
  "33193": ["Miami", "Miami-Dade"], "33194": ["Miami", "Miami-Dade"], "33196": ["Miami", "Miami-Dade"],
  "33199": ["Miami", "Miami-Dade"],
  // Homestead/Florida City
  "33030": ["Homestead", "Miami-Dade"], "33031": ["Homestead", "Miami-Dade"], "33032": ["Homestead", "Miami-Dade"],
  "33033": ["Homestead", "Miami-Dade"], "33034": ["Florida City", "Miami-Dade"], "33035": ["Homestead", "Miami-Dade"],
  
  // Broward County
  "33004": ["Dania Beach", "Broward"], "33009": ["Hallandale Beach", "Broward"], "33019": ["Hollywood", "Broward"],
  "33020": ["Hollywood", "Broward"], "33021": ["Hollywood", "Broward"], "33022": ["Hollywood", "Broward"],
  "33023": ["Hollywood", "Broward"], "33024": ["Hollywood", "Broward"], "33025": ["Hollywood", "Broward"],
  "33026": ["Hollywood", "Broward"], "33027": ["Hollywood", "Broward"], "33028": ["Pembroke Pines", "Broward"],
  "33029": ["Pembroke Pines", "Broward"], "33060": ["Pompano Beach", "Broward"], "33062": ["Pompano Beach", "Broward"],
  "33063": ["Coconut Creek", "Broward"], "33064": ["Pompano Beach", "Broward"], "33065": ["Coral Springs", "Broward"],
  "33066": ["Coconut Creek", "Broward"], "33067": ["Coral Springs", "Broward"], "33068": ["Pompano Beach", "Broward"],
  "33069": ["Pompano Beach", "Broward"], "33071": ["Coral Springs", "Broward"], "33073": ["Coconut Creek", "Broward"],
  "33076": ["Coral Springs", "Broward"], "33301": ["Fort Lauderdale", "Broward"], "33304": ["Fort Lauderdale", "Broward"],
  "33305": ["Fort Lauderdale", "Broward"], "33306": ["Fort Lauderdale", "Broward"], "33308": ["Fort Lauderdale", "Broward"],
  "33309": ["Fort Lauderdale", "Broward"], "33310": ["Fort Lauderdale", "Broward"], "33311": ["Fort Lauderdale", "Broward"],
  "33312": ["Fort Lauderdale", "Broward"], "33313": ["Fort Lauderdale", "Broward"], "33314": ["Fort Lauderdale", "Broward"],
  "33315": ["Fort Lauderdale", "Broward"], "33316": ["Fort Lauderdale", "Broward"], "33317": ["Fort Lauderdale", "Broward"],
  "33319": ["Fort Lauderdale", "Broward"], "33321": ["Tamarac", "Broward"], "33322": ["Fort Lauderdale", "Broward"],
  "33323": ["Fort Lauderdale", "Broward"], "33324": ["Fort Lauderdale", "Broward"], "33325": ["Fort Lauderdale", "Broward"],
  "33326": ["Fort Lauderdale", "Broward"], "33327": ["Fort Lauderdale", "Broward"], "33328": ["Fort Lauderdale", "Broward"],
  "33330": ["Fort Lauderdale", "Broward"], "33331": ["Fort Lauderdale", "Broward"], "33332": ["Fort Lauderdale", "Broward"],
  "33334": ["Oakland Park", "Broward"], "33351": ["Fort Lauderdale", "Broward"], "33388": ["Plantation", "Broward"],
  "33317": ["Plantation", "Broward"], "33324": ["Plantation", "Broward"], "33325": ["Plantation", "Broward"],
  "33071": ["Coral Springs", "Broward"], "33065": ["Coral Springs", "Broward"],
  "33441": ["Deerfield Beach", "Broward"], "33442": ["Deerfield Beach", "Broward"], "33443": ["Deerfield Beach", "Broward"],
  "33428": ["Boca Raton", "Palm Beach"],
  
  // Palm Beach County
  "33401": ["West Palm Beach", "Palm Beach"], "33402": ["West Palm Beach", "Palm Beach"], "33403": ["West Palm Beach", "Palm Beach"],
  "33404": ["West Palm Beach", "Palm Beach"], "33405": ["West Palm Beach", "Palm Beach"], "33406": ["West Palm Beach", "Palm Beach"],
  "33407": ["West Palm Beach", "Palm Beach"], "33408": ["North Palm Beach", "Palm Beach"], "33409": ["West Palm Beach", "Palm Beach"],
  "33410": ["Palm Beach Gardens", "Palm Beach"], "33411": ["West Palm Beach", "Palm Beach"], "33412": ["Palm Beach Gardens", "Palm Beach"],
  "33413": ["West Palm Beach", "Palm Beach"], "33414": ["Wellington", "Palm Beach"], "33415": ["West Palm Beach", "Palm Beach"],
  "33417": ["West Palm Beach", "Palm Beach"], "33418": ["Palm Beach Gardens", "Palm Beach"], "33426": ["Boynton Beach", "Palm Beach"],
  "33428": ["Boca Raton", "Palm Beach"], "33430": ["Belle Glade", "Palm Beach"], "33431": ["Boca Raton", "Palm Beach"],
  "33432": ["Boca Raton", "Palm Beach"], "33433": ["Boca Raton", "Palm Beach"], "33434": ["Boca Raton", "Palm Beach"],
  "33435": ["Boynton Beach", "Palm Beach"], "33436": ["Boynton Beach", "Palm Beach"], "33437": ["Boynton Beach", "Palm Beach"],
  "33438": ["Canal Point", "Palm Beach"], "33440": ["Clewiston", "Hendry"], "33444": ["Delray Beach", "Palm Beach"],
  "33445": ["Delray Beach", "Palm Beach"], "33446": ["Delray Beach", "Palm Beach"], "33448": ["Belle Glade", "Palm Beach"],
  "33449": ["Lake Worth", "Palm Beach"], "33458": ["Jupiter", "Palm Beach"], "33460": ["Lake Worth Beach", "Palm Beach"],
  "33461": ["Lake Worth Beach", "Palm Beach"], "33462": ["Lake Worth Beach", "Palm Beach"], "33463": ["Lake Worth", "Palm Beach"],
  "33467": ["Lake Worth", "Palm Beach"], "33469": ["Jupiter", "Palm Beach"], "33470": ["Loxahatchee", "Palm Beach"],
  "33472": ["Greenacres", "Palm Beach"], "33473": ["Greenacres", "Palm Beach"], "33476": ["Pahokee", "Palm Beach"],
  "33477": ["Jupiter", "Palm Beach"], "33478": ["Jupiter", "Palm Beach"], "33480": ["Palm Beach", "Palm Beach"],
  "33483": ["Delray Beach", "Palm Beach"], "33484": ["Delray Beach", "Palm Beach"], "33486": ["Boca Raton", "Palm Beach"],
  "33487": ["Boca Raton", "Palm Beach"], "33493": ["South Bay", "Palm Beach"], "33496": ["Boca Raton", "Palm Beach"],
  "33498": ["Boca Raton", "Palm Beach"],
  
  // Orange County (Orlando area)
  "32703": ["Apopka", "Orange"], "32704": ["Apopka", "Orange"], "32712": ["Apopka", "Orange"],
  "32789": ["Winter Park", "Orange"], "32792": ["Winter Park", "Orange"], "32801": ["Orlando", "Orange"],
  "32802": ["Orlando", "Orange"], "32803": ["Orlando", "Orange"], "32804": ["Orlando", "Orange"],
  "32805": ["Orlando", "Orange"], "32806": ["Orlando", "Orange"], "32807": ["Orlando", "Orange"],
  "32808": ["Orlando", "Orange"], "32809": ["Orlando", "Orange"], "32810": ["Orlando", "Orange"],
  "32811": ["Orlando", "Orange"], "32812": ["Orlando", "Orange"], "32814": ["Orlando", "Orange"],
  "32817": ["Orlando", "Orange"], "32818": ["Orlando", "Orange"], "32819": ["Orlando", "Orange"],
  "32820": ["Orlando", "Orange"], "32821": ["Orlando", "Orange"], "32822": ["Orlando", "Orange"],
  "32824": ["Orlando", "Orange"], "32825": ["Orlando", "Orange"], "32826": ["Orlando", "Orange"],
  "32827": ["Orlando", "Orange"], "32828": ["Orlando", "Orange"], "32829": ["Orlando", "Orange"],
  "32830": ["Orlando", "Orange"], "32831": ["Orlando", "Orange"], "32832": ["Orlando", "Orange"],
  "32833": ["Orlando", "Orange"], "32835": ["Orlando", "Orange"], "32836": ["Orlando", "Orange"],
  "32837": ["Orlando", "Orange"], "32839": ["Orlando", "Orange"],
  
  // Seminole County
  "32701": ["Altamonte Springs", "Seminole"], "32707": ["Casselberry", "Seminole"], "32708": ["Winter Springs", "Seminole"],
  "32714": ["Altamonte Springs", "Seminole"], "32730": ["Casselberry", "Seminole"], "32732": ["Geneva", "Seminole"],
  "32746": ["Lake Mary", "Seminole"], "32750": ["Longwood", "Seminole"], "32765": ["Oviedo", "Seminole"],
  "32766": ["Oviedo", "Seminole"], "32771": ["Sanford", "Seminole"], "32773": ["Sanford", "Seminole"],
  
  // Osceola County
  "34741": ["Kissimmee", "Osceola"], "34742": ["Kissimmee", "Osceola"], "34743": ["Kissimmee", "Osceola"],
  "34744": ["Kissimmee", "Osceola"], "34745": ["Kissimmee", "Osceola"], "34746": ["Kissimmee", "Osceola"],
  "34747": ["Kissimmee", "Osceola"], "34758": ["Kissimmee", "Osceola"], "34769": ["St Cloud", "Osceola"],
  "34771": ["St Cloud", "Osceola"], "34772": ["St Cloud", "Osceola"], "34773": ["St Cloud", "Osceola"],
  
  // Polk County
  "33801": ["Lakeland", "Polk"], "33803": ["Lakeland", "Polk"], "33805": ["Lakeland", "Polk"],
  "33809": ["Lakeland", "Polk"], "33810": ["Lakeland", "Polk"], "33811": ["Lakeland", "Polk"],
  "33812": ["Lakeland", "Polk"], "33813": ["Lakeland", "Polk"], "33815": ["Lakeland", "Polk"],
  "33823": ["Auburndale", "Polk"], "33825": ["Avon Park", "Highlands"], "33827": ["Babson Park", "Polk"],
  "33830": ["Bartow", "Polk"], "33834": ["Bowling Green", "Hardee"], "33835": ["Bradley", "Polk"],
  "33837": ["Davenport", "Polk"], "33838": ["Dundee", "Polk"], "33839": ["Eagle Lake", "Polk"],
  "33840": ["Eaton Park", "Polk"], "33841": ["Fort Meade", "Polk"], "33843": ["Frostproof", "Polk"],
  "33844": ["Haines City", "Polk"], "33847": ["Highland City", "Polk"], "33849": ["Homeland", "Polk"],
  "33850": ["Kathleen", "Polk"], "33851": ["Lake Alfred", "Polk"], "33852": ["Lake Placid", "Highlands"],
  "33853": ["Lake Wales", "Polk"], "33854": ["Lakeshore", "Polk"], "33855": ["Indian Lake Estates", "Polk"],
  "33857": ["Lorida", "Highlands"], "33858": ["Mulberry", "Polk"], "33859": ["Mulberry", "Polk"],
  "33860": ["Mulberry", "Polk"], "33863": ["Nichols", "Polk"], "33865": ["Ona", "Hardee"],
  "33867": ["River Ranch", "Polk"], "33868": ["Polk City", "Polk"], "33870": ["Sebring", "Highlands"],
  "33871": ["Sebring", "Highlands"], "33872": ["Sebring", "Highlands"], "33873": ["Wauchula", "Hardee"],
  "33875": ["Venus", "Highlands"], "33876": ["Venus", "Highlands"], "33877": ["Waverly", "Polk"],
  "33880": ["Winter Haven", "Polk"], "33881": ["Winter Haven", "Polk"], "33884": ["Winter Haven", "Polk"],
  "33896": ["Davenport", "Polk"], "33897": ["Davenport", "Polk"], "33898": ["Lake Wales", "Polk"],
  
  // Hillsborough County (Tampa)
  "33510": ["Brandon", "Hillsborough"], "33511": ["Brandon", "Hillsborough"], "33527": ["Dover", "Hillsborough"],
  "33534": ["Gibsonton", "Hillsborough"], "33547": ["Lithia", "Hillsborough"], "33549": ["Lutz", "Hillsborough"],
  "33556": ["Odessa", "Hillsborough"], "33558": ["Lutz", "Hillsborough"], "33563": ["Plant City", "Hillsborough"],
  "33565": ["Plant City", "Hillsborough"], "33566": ["Plant City", "Hillsborough"], "33567": ["Plant City", "Hillsborough"],
  "33569": ["Riverview", "Hillsborough"], "33570": ["Ruskin", "Hillsborough"], "33572": ["Apollo Beach", "Hillsborough"],
  "33573": ["Sun City Center", "Hillsborough"], "33578": ["Riverview", "Hillsborough"], "33579": ["Riverview", "Hillsborough"],
  "33584": ["Seffner", "Hillsborough"], "33592": ["Thonotosassa", "Hillsborough"], "33594": ["Valrico", "Hillsborough"],
  "33596": ["Valrico", "Hillsborough"], "33598": ["Wimauma", "Hillsborough"],
  "33601": ["Tampa", "Hillsborough"], "33602": ["Tampa", "Hillsborough"], "33603": ["Tampa", "Hillsborough"],
  "33604": ["Tampa", "Hillsborough"], "33605": ["Tampa", "Hillsborough"], "33606": ["Tampa", "Hillsborough"],
  "33607": ["Tampa", "Hillsborough"], "33609": ["Tampa", "Hillsborough"], "33610": ["Tampa", "Hillsborough"],
  "33611": ["Tampa", "Hillsborough"], "33612": ["Tampa", "Hillsborough"], "33613": ["Tampa", "Hillsborough"],
  "33614": ["Tampa", "Hillsborough"], "33615": ["Tampa", "Hillsborough"], "33616": ["Tampa", "Hillsborough"],
  "33617": ["Tampa", "Hillsborough"], "33618": ["Tampa", "Hillsborough"], "33619": ["Tampa", "Hillsborough"],
  "33620": ["Tampa", "Hillsborough"], "33621": ["Tampa", "Hillsborough"], "33624": ["Tampa", "Hillsborough"],
  "33625": ["Tampa", "Hillsborough"], "33626": ["Tampa", "Hillsborough"], "33629": ["Tampa", "Hillsborough"],
  "33634": ["Tampa", "Hillsborough"], "33635": ["Tampa", "Hillsborough"], "33637": ["Tampa", "Hillsborough"],
  "33647": ["Tampa", "Hillsborough"],
  
  // Pinellas County (St Petersburg, Clearwater)
  "33701": ["St Petersburg", "Pinellas"], "33702": ["St Petersburg", "Pinellas"], "33703": ["St Petersburg", "Pinellas"],
  "33704": ["St Petersburg", "Pinellas"], "33705": ["St Petersburg", "Pinellas"], "33706": ["St Petersburg", "Pinellas"],
  "33707": ["St Petersburg", "Pinellas"], "33708": ["St Petersburg", "Pinellas"], "33709": ["St Petersburg", "Pinellas"],
  "33710": ["St Petersburg", "Pinellas"], "33711": ["St Petersburg", "Pinellas"], "33712": ["St Petersburg", "Pinellas"],
  "33713": ["St Petersburg", "Pinellas"], "33714": ["St Petersburg", "Pinellas"], "33715": ["St Petersburg", "Pinellas"],
  "33716": ["St Petersburg", "Pinellas"], "33755": ["Clearwater", "Pinellas"], "33756": ["Clearwater", "Pinellas"],
  "33759": ["Clearwater", "Pinellas"], "33760": ["Clearwater", "Pinellas"], "33761": ["Clearwater", "Pinellas"],
  "33762": ["Clearwater", "Pinellas"], "33763": ["Clearwater", "Pinellas"], "33764": ["Clearwater", "Pinellas"],
  "33765": ["Clearwater", "Pinellas"], "33767": ["Clearwater Beach", "Pinellas"], "33770": ["Largo", "Pinellas"],
  "33771": ["Largo", "Pinellas"], "33772": ["Seminole", "Pinellas"], "33773": ["Largo", "Pinellas"],
  "33774": ["Largo", "Pinellas"], "33776": ["Seminole", "Pinellas"], "33777": ["Seminole", "Pinellas"],
  "33778": ["Largo", "Pinellas"], "33781": ["Pinellas Park", "Pinellas"], "33782": ["Pinellas Park", "Pinellas"],
  "33785": ["Indian Rocks Beach", "Pinellas"], "33786": ["Belleair Beach", "Pinellas"],
  
  // Pasco County
  "33523": ["Dade City", "Pasco"], "33525": ["Dade City", "Pasco"], "33537": ["Lacoochee", "Pasco"],
  "33541": ["San Antonio", "Pasco"], "33543": ["Wesley Chapel", "Pasco"], "33544": ["Wesley Chapel", "Pasco"],
  "33545": ["Wesley Chapel", "Pasco"], "33559": ["Lutz", "Pasco"], "34610": ["Crystal Springs", "Pasco"],
  "34613": ["Brooksville", "Hernando"], "34637": ["Land O Lakes", "Pasco"], "34638": ["Land O Lakes", "Pasco"],
  "34639": ["Land O Lakes", "Pasco"], "34652": ["New Port Richey", "Pasco"], "34653": ["New Port Richey", "Pasco"],
  "34654": ["New Port Richey", "Pasco"], "34655": ["New Port Richey", "Pasco"], "34667": ["Hudson", "Pasco"],
  "34668": ["Port Richey", "Pasco"], "34669": ["Hudson", "Pasco"], "34690": ["Holiday", "Pasco"],
  "34691": ["Holiday", "Pasco"], "34695": ["Safety Harbor", "Pinellas"],
  
  // Duval County (Jacksonville)
  "32073": ["Orange Park", "Clay"], "32202": ["Jacksonville", "Duval"], "32204": ["Jacksonville", "Duval"],
  "32205": ["Jacksonville", "Duval"], "32206": ["Jacksonville", "Duval"], "32207": ["Jacksonville", "Duval"],
  "32208": ["Jacksonville", "Duval"], "32209": ["Jacksonville", "Duval"], "32210": ["Jacksonville", "Duval"],
  "32211": ["Jacksonville", "Duval"], "32212": ["Jacksonville", "Duval"], "32214": ["Jacksonville", "Duval"],
  "32216": ["Jacksonville", "Duval"], "32217": ["Jacksonville", "Duval"], "32218": ["Jacksonville", "Duval"],
  "32219": ["Jacksonville", "Duval"], "32220": ["Jacksonville", "Duval"], "32221": ["Jacksonville", "Duval"],
  "32222": ["Jacksonville", "Duval"], "32223": ["Jacksonville", "Duval"], "32224": ["Jacksonville", "Duval"],
  "32225": ["Jacksonville", "Duval"], "32226": ["Jacksonville", "Duval"], "32227": ["Jacksonville Beach", "Duval"],
  "32228": ["Jacksonville", "Duval"], "32233": ["Atlantic Beach", "Duval"], "32234": ["Jacksonville", "Duval"],
  "32244": ["Jacksonville", "Duval"], "32246": ["Jacksonville", "Duval"], "32250": ["Jacksonville Beach", "Duval"],
  "32254": ["Jacksonville", "Duval"], "32256": ["Jacksonville", "Duval"], "32257": ["Jacksonville", "Duval"],
  "32258": ["Jacksonville", "Duval"], "32259": ["Jacksonville", "St. Johns"], "32266": ["Neptune Beach", "Duval"],
  "32277": ["Jacksonville", "Duval"],
  
  // Clay County
  "32003": ["Fleming Island", "Clay"], "32006": ["Fleming Island", "Clay"], "32043": ["Green Cove Springs", "Clay"],
  "32065": ["Orange Park", "Clay"], "32068": ["Middleburg", "Clay"], "32073": ["Orange Park", "Clay"],
  "32079": ["Penney Farms", "Clay"], "32234": ["Maxville", "Clay"],
  
  // St. Johns County
  "32080": ["St Augustine", "St. Johns"], "32081": ["Ponte Vedra Beach", "St. Johns"], "32082": ["Ponte Vedra Beach", "St. Johns"],
  "32084": ["St Augustine", "St. Johns"], "32086": ["St Augustine", "St. Johns"], "32092": ["St Augustine", "St. Johns"],
  "32095": ["St Augustine", "St. Johns"], "32259": ["St Johns", "St. Johns"],
  
  // Brevard County (Space Coast)
  "32901": ["Melbourne", "Brevard"], "32903": ["Indialantic", "Brevard"], "32904": ["Melbourne", "Brevard"],
  "32905": ["Palm Bay", "Brevard"], "32907": ["Palm Bay", "Brevard"], "32908": ["Palm Bay", "Brevard"],
  "32909": ["Palm Bay", "Brevard"], "32920": ["Cape Canaveral", "Brevard"], "32922": ["Cocoa", "Brevard"],
  "32926": ["Cocoa", "Brevard"], "32927": ["Cocoa", "Brevard"], "32931": ["Cocoa Beach", "Brevard"],
  "32934": ["Melbourne", "Brevard"], "32935": ["Melbourne", "Brevard"], "32937": ["Melbourne Beach", "Brevard"],
  "32940": ["Melbourne", "Brevard"], "32948": ["Fellsmere", "Indian River"], "32949": ["Grant", "Brevard"],
  "32950": ["Malabar", "Brevard"], "32951": ["Melbourne Beach", "Brevard"], "32952": ["Merritt Island", "Brevard"],
  "32953": ["Merritt Island", "Brevard"], "32955": ["Rockledge", "Brevard"], "32958": ["Sebastian", "Indian River"],
  "32963": ["Vero Beach", "Indian River"], "32966": ["Vero Beach", "Indian River"], "32967": ["Vero Beach", "Indian River"],
  "32968": ["Vero Beach", "Indian River"], "32976": ["Sebastian", "Indian River"],
  
  // Volusia County (Daytona)
  "32114": ["Daytona Beach", "Volusia"], "32117": ["Daytona Beach", "Volusia"], "32118": ["Daytona Beach", "Volusia"],
  "32119": ["Daytona Beach", "Volusia"], "32124": ["Daytona Beach", "Volusia"], "32127": ["Port Orange", "Volusia"],
  "32128": ["Port Orange", "Volusia"], "32129": ["Port Orange", "Volusia"], "32130": ["De Leon Springs", "Volusia"],
  "32132": ["Edgewater", "Volusia"], "32168": ["New Smyrna Beach", "Volusia"], "32169": ["New Smyrna Beach", "Volusia"],
  "32174": ["Ormond Beach", "Volusia"], "32176": ["Ormond Beach", "Volusia"], "32713": ["DeBary", "Volusia"],
  "32720": ["DeLand", "Volusia"], "32723": ["DeLand", "Volusia"], "32724": ["DeLand", "Volusia"],
  "32725": ["Deltona", "Volusia"], "32738": ["Deltona", "Volusia"], "32739": ["Deltona", "Volusia"],
  "32759": ["Oak Hill", "Volusia"], "32763": ["Orange City", "Volusia"],
  
  // Lee County (Fort Myers)
  "33901": ["Fort Myers", "Lee"], "33903": ["Fort Myers", "Lee"], "33904": ["Cape Coral", "Lee"],
  "33905": ["Fort Myers", "Lee"], "33907": ["Fort Myers", "Lee"], "33908": ["Fort Myers", "Lee"],
  "33909": ["Cape Coral", "Lee"], "33912": ["Fort Myers", "Lee"], "33913": ["Fort Myers", "Lee"],
  "33914": ["Cape Coral", "Lee"], "33916": ["Fort Myers", "Lee"], "33917": ["North Fort Myers", "Lee"],
  "33919": ["Fort Myers", "Lee"], "33920": ["Alva", "Lee"], "33921": ["Boca Grande", "Lee"],
  "33922": ["Bokeelia", "Lee"], "33924": ["Captiva", "Lee"], "33928": ["Estero", "Lee"],
  "33931": ["Fort Myers Beach", "Lee"], "33936": ["Lehigh Acres", "Lee"], "33956": ["North Fort Myers", "Lee"],
  "33957": ["Sanibel", "Lee"], "33965": ["Fort Myers", "Lee"], "33966": ["Fort Myers", "Lee"],
  "33967": ["Fort Myers", "Lee"], "33971": ["Lehigh Acres", "Lee"], "33972": ["Lehigh Acres", "Lee"],
  "33973": ["Lehigh Acres", "Lee"], "33974": ["Lehigh Acres", "Lee"], "33976": ["Lehigh Acres", "Lee"],
  "33990": ["Cape Coral", "Lee"], "33991": ["Cape Coral", "Lee"], "33993": ["Cape Coral", "Lee"],
  
  // Collier County (Naples)
  "34102": ["Naples", "Collier"], "34103": ["Naples", "Collier"], "34104": ["Naples", "Collier"],
  "34105": ["Naples", "Collier"], "34108": ["Naples", "Collier"], "34109": ["Naples", "Collier"],
  "34110": ["Naples", "Collier"], "34112": ["Naples", "Collier"], "34113": ["Naples", "Collier"],
  "34114": ["Naples", "Collier"], "34116": ["Naples", "Collier"], "34117": ["Naples", "Collier"],
  "34119": ["Naples", "Collier"], "34120": ["Naples", "Collier"], "34134": ["Bonita Springs", "Lee"],
  "34135": ["Bonita Springs", "Lee"], "34140": ["Goodland", "Collier"], "34141": ["Ochopee", "Collier"],
  "34142": ["Immokalee", "Collier"], "34145": ["Marco Island", "Collier"],
  
  // Sarasota County
  "34228": ["Longboat Key", "Sarasota"], "34229": ["Osprey", "Sarasota"], "34230": ["Sarasota", "Sarasota"],
  "34231": ["Sarasota", "Sarasota"], "34232": ["Sarasota", "Sarasota"], "34233": ["Sarasota", "Sarasota"],
  "34234": ["Sarasota", "Sarasota"], "34235": ["Sarasota", "Sarasota"], "34236": ["Sarasota", "Sarasota"],
  "34237": ["Sarasota", "Sarasota"], "34238": ["Sarasota", "Sarasota"], "34239": ["Sarasota", "Sarasota"],
  "34240": ["Sarasota", "Sarasota"], "34241": ["Sarasota", "Sarasota"], "34242": ["Sarasota", "Sarasota"],
  "34243": ["Sarasota", "Sarasota"], "34275": ["Nokomis", "Sarasota"], "34285": ["Venice", "Sarasota"],
  "34286": ["North Port", "Sarasota"], "34287": ["North Port", "Sarasota"], "34288": ["North Port", "Sarasota"],
  "34289": ["North Port", "Sarasota"], "34291": ["North Port", "Sarasota"], "34292": ["Venice", "Sarasota"],
  "34293": ["Venice", "Sarasota"],
  
  // Manatee County
  "34201": ["Bradenton", "Manatee"], "34202": ["Bradenton", "Manatee"], "34203": ["Bradenton", "Manatee"],
  "34205": ["Bradenton", "Manatee"], "34207": ["Bradenton", "Manatee"], "34208": ["Bradenton", "Manatee"],
  "34209": ["Bradenton", "Manatee"], "34210": ["Bradenton", "Manatee"], "34211": ["Bradenton", "Manatee"],
  "34212": ["Bradenton", "Manatee"], "34215": ["Cortez", "Manatee"], "34216": ["Anna Maria", "Manatee"],
  "34217": ["Bradenton Beach", "Manatee"], "34218": ["Holmes Beach", "Manatee"], "34219": ["Parrish", "Manatee"],
  "34220": ["Palmetto", "Manatee"], "34221": ["Palmetto", "Manatee"], "34222": ["Ellenton", "Manatee"],
  "34223": ["Englewood", "Charlotte"], "34224": ["Englewood", "Charlotte"],
  
  // Charlotte County
  "33948": ["Port Charlotte", "Charlotte"], "33950": ["Punta Gorda", "Charlotte"], "33952": ["Port Charlotte", "Charlotte"],
  "33953": ["Port Charlotte", "Charlotte"], "33954": ["Port Charlotte", "Charlotte"], "33955": ["Punta Gorda", "Charlotte"],
  "33980": ["Port Charlotte", "Charlotte"], "33981": ["Port Charlotte", "Charlotte"], "33982": ["Punta Gorda", "Charlotte"],
  "33983": ["Punta Gorda", "Charlotte"],
  
  // Martin County
  "34956": ["Indiantown", "Martin"], "34957": ["Jensen Beach", "Martin"], "34990": ["Palm City", "Martin"],
  "34994": ["Stuart", "Martin"], "34996": ["Stuart", "Martin"], "34997": ["Stuart", "Martin"],
  
  // St. Lucie County
  "34945": ["Fort Pierce", "St. Lucie"], "34946": ["Fort Pierce", "St. Lucie"], "34947": ["Fort Pierce", "St. Lucie"],
  "34949": ["Fort Pierce", "St. Lucie"], "34950": ["Fort Pierce", "St. Lucie"], "34951": ["Fort Pierce", "St. Lucie"],
  "34952": ["Port St Lucie", "St. Lucie"], "34953": ["Port St Lucie", "St. Lucie"], "34983": ["Port St Lucie", "St. Lucie"],
  "34984": ["Port St Lucie", "St. Lucie"], "34986": ["Port St Lucie", "St. Lucie"], "34987": ["Port St Lucie", "St. Lucie"],
  "34988": ["Port St Lucie", "St. Lucie"],
  
  // Alachua County (Gainesville)
  "32601": ["Gainesville", "Alachua"], "32603": ["Gainesville", "Alachua"], "32605": ["Gainesville", "Alachua"],
  "32606": ["Gainesville", "Alachua"], "32607": ["Gainesville", "Alachua"], "32608": ["Gainesville", "Alachua"],
  "32609": ["Gainesville", "Alachua"], "32612": ["Gainesville", "Alachua"], "32615": ["Alachua", "Alachua"],
  "32618": ["Archer", "Alachua"], "32640": ["Hawthorne", "Alachua"], "32641": ["Gainesville", "Alachua"],
  "32643": ["High Springs", "Alachua"], "32653": ["Gainesville", "Alachua"], "32669": ["Newberry", "Alachua"],
  
  // Leon County (Tallahassee)
  "32301": ["Tallahassee", "Leon"], "32303": ["Tallahassee", "Leon"], "32304": ["Tallahassee", "Leon"],
  "32305": ["Tallahassee", "Leon"], "32306": ["Tallahassee", "Leon"], "32308": ["Tallahassee", "Leon"],
  "32309": ["Tallahassee", "Leon"], "32310": ["Tallahassee", "Leon"], "32311": ["Tallahassee", "Leon"],
  "32312": ["Tallahassee", "Leon"], "32317": ["Tallahassee", "Leon"],
  
  // Escambia County (Pensacola)
  "32501": ["Pensacola", "Escambia"], "32502": ["Pensacola", "Escambia"], "32503": ["Pensacola", "Escambia"],
  "32504": ["Pensacola", "Escambia"], "32505": ["Pensacola", "Escambia"], "32506": ["Pensacola", "Escambia"],
  "32507": ["Pensacola", "Escambia"], "32508": ["Pensacola", "Escambia"], "32514": ["Pensacola", "Escambia"],
  "32526": ["Pensacola", "Escambia"], "32533": ["Cantonment", "Escambia"], "32534": ["Pensacola", "Escambia"],
  "32535": ["Century", "Escambia"], "32561": ["Gulf Breeze", "Santa Rosa"], "32563": ["Gulf Breeze", "Santa Rosa"],
  "32566": ["Navarre", "Santa Rosa"], "32568": ["Jay", "Santa Rosa"], "32570": ["Milton", "Santa Rosa"],
  "32571": ["Milton", "Santa Rosa"], "32583": ["Milton", "Santa Rosa"],
  
  // Bay County (Panama City)
  "32401": ["Panama City", "Bay"], "32404": ["Panama City", "Bay"], "32405": ["Panama City", "Bay"],
  "32406": ["Panama City", "Bay"], "32407": ["Panama City Beach", "Bay"], "32408": ["Panama City Beach", "Bay"],
  "32409": ["Panama City Beach", "Bay"], "32410": ["Mexico Beach", "Bay"], "32413": ["Panama City Beach", "Bay"],
  "32438": ["Fountain", "Bay"], "32444": ["Lynn Haven", "Bay"], "32456": ["Port St Joe", "Gulf"],
  
  // Okaloosa County (Fort Walton Beach)
  "32536": ["Crestview", "Okaloosa"], "32539": ["Crestview", "Okaloosa"], "32541": ["Destin", "Okaloosa"],
  "32547": ["Fort Walton Beach", "Okaloosa"], "32548": ["Fort Walton Beach", "Okaloosa"], "32549": ["Fort Walton Beach", "Okaloosa"],
  "32564": ["Holt", "Okaloosa"], "32567": ["Laurel Hill", "Okaloosa"], "32569": ["Mary Esther", "Okaloosa"],
  "32578": ["Niceville", "Okaloosa"], "32579": ["Shalimar", "Okaloosa"], "32580": ["Valparaiso", "Okaloosa"],
  
  // Lake County
  "32159": ["Lady Lake", "Lake"], "32702": ["Altoona", "Lake"], "32726": ["Eustis", "Lake"],
  "32735": ["Grand Island", "Lake"], "32736": ["Eustis", "Lake"], "32757": ["Mount Dora", "Lake"],
  "32767": ["Paisley", "Lake"], "32778": ["Tavares", "Lake"], "32784": ["Umatilla", "Lake"],
  "34711": ["Clermont", "Lake"], "34714": ["Clermont", "Lake"], "34715": ["Clermont", "Lake"],
  "34729": ["Ferndale", "Lake"], "34731": ["Fruitland Park", "Lake"], "34736": ["Groveland", "Lake"],
  "34737": ["Howey In The Hills", "Lake"], "34748": ["Leesburg", "Lake"], "34753": ["Mascotte", "Lake"],
  "34756": ["Montverde", "Lake"], "34762": ["Okahumpka", "Lake"], "34788": ["Leesburg", "Lake"],
  "34797": ["Yalaha", "Lake"],
  
  // Marion County (Ocala)
  "32111": ["Citra", "Marion"], "32113": ["Citra", "Marion"], "32134": ["Fort McCoy", "Marion"],
  "32179": ["Ocklawaha", "Marion"], "32617": ["Anthony", "Marion"], "32625": ["Cedar Key", "Levy"],
  "32626": ["Chiefland", "Levy"], "32634": ["Fairfield", "Marion"], "32667": ["McIntosh", "Marion"],
  "32680": ["Old Town", "Dixie"], "32681": ["Orange Lake", "Marion"], "32686": ["Reddick", "Marion"],
  "32693": ["Trenton", "Gilchrist"], "34420": ["Belleview", "Marion"], "34429": ["Crystal River", "Citrus"],
  "34430": ["Dunnellon", "Marion"], "34431": ["Dunnellon", "Marion"], "34432": ["Dunnellon", "Marion"],
  "34470": ["Ocala", "Marion"], "34471": ["Ocala", "Marion"], "34472": ["Ocala", "Marion"],
  "34473": ["Ocala", "Marion"], "34474": ["Ocala", "Marion"], "34475": ["Ocala", "Marion"],
  "34476": ["Ocala", "Marion"], "34479": ["Ocala", "Marion"], "34480": ["Ocala", "Marion"],
  "34481": ["Ocala", "Marion"], "34482": ["Ocala", "Marion"], "34488": ["Silver Springs", "Marion"],
  "34491": ["Summerfield", "Marion"],
};

/**
 * Look up city, state, and county from ZIP code
 * @param zip 5-digit ZIP code
 * @returns { city, state, county } or null if not found
 */
export function lookupZip(zip: string): ZipInfo | null {
  const data = FL_ZIPS[zip];
  if (data) {
    return { city: data[0], state: "FL", county: data[1] };
  }
  return null;
}

/**
 * Get all ZIP codes for a city
 * @param city City name (case-insensitive)
 */
export function getZipsForCity(city: string): string[] {
  const normalizedCity = city.toLowerCase().trim();
  return Object.entries(FL_ZIPS)
    .filter(([_, data]) => data[0].toLowerCase() === normalizedCity)
    .map(([zip]) => zip);
}

/**
 * Get all ZIP codes for a county
 * @param county County name (case-insensitive)
 */
export function getZipsForCounty(county: string): string[] {
  const normalizedCounty = county.toLowerCase().trim();
  return Object.entries(FL_ZIPS)
    .filter(([_, data]) => data[1].toLowerCase() === normalizedCounty)
    .map(([zip]) => zip);
}

/**
 * Check if a ZIP code is valid (in our database)
 */
export function isValidZip(zip: string): boolean {
  return zip in FL_ZIPS;
}

export default lookupZip;
