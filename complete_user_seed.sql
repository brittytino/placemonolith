-- ============================================================================
-- CHECK AND CREATE WHITELIST TABLE IF NOT EXISTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.whitelist (
  email TEXT PRIMARY KEY,
  name TEXT,
  reg_no TEXT,
  batch TEXT,
  team_id TEXT,
  roles JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CLEAR EXISTING WHITELIST
-- ============================================================================
TRUNCATE TABLE public.whitelist;

-- ============================================================================
-- INSERT ALL STUDENTS INTO WHITELIST
-- ============================================================================
INSERT INTO public.whitelist (email, name, reg_no, batch, team_id, roles) VALUES
-- TEAM 1
('25mx301@psgtech.ac.in', 'Abishek S', '25MX301', 'G2', 'T01', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx205@psgtech.ac.in', 'G.DEEPIKA RAJA LAKSHAYA', '25MX205', 'G1', 'T01', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx121@psgtech.ac.in', 'Sathish M', '25MX121', 'G1', 'T01', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx332@psgtech.ac.in', 'Muthu Sailappan', '25MX332', 'G2', 'T01', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx348@psgtech.ac.in', 'S.S.SOBAN', '25MX348', 'G2', 'T01', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx231@psgtech.ac.in', 'Vaishnavi S', '25MX231', 'G1', 'T01', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 2
('25mx308@psgtech.ac.in', 'Dayananda J', '25MX308', 'G2', 'T02', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx208@psgtech.ac.in', 'Dinakaran T', '25MX208', 'G1', 'T02', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx229@psgtech.ac.in', 'Surya L', '25MX229', 'G1', 'T02', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx315@psgtech.ac.in', 'Induja E', '25MX315', 'G2', 'T02', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx359@psgtech.ac.in', 'Vishnuvardani K S', '25MX359', 'G2', 'T02', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx213@psgtech.ac.in', 'MOWLIDHARAN', '25MX213', 'G1', 'T02', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 3
('25mx314@psgtech.ac.in', 'Hari Balaji', '25MX314', 'G2', 'T03', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx313@psgtech.ac.in', 'Lalit Chandran', '25MX313', 'G2', 'T03', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx120@psgtech.ac.in', 'R Sibidharan', '25MX120', 'G1', 'T03', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx227@psgtech.ac.in', 'Sudherson V', '25MX227', 'G1', 'T03', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx334@psgtech.ac.in', 'Nandhithasri', '25MX334', 'G2', 'T03', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx210@psgtech.ac.in', 'Gayathri', '25MX210', 'G1', 'T03', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 4
('25mx318@psgtech.ac.in', 'Jeeva silviya J', '25MX318', 'G2', 'T04', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx102@psgtech.ac.in', 'Balasubramaniam S', '25MX102', 'G1', 'T04', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx118@psgtech.ac.in', 'OVIYA S', '25MX118', 'G1', 'T04', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx108@psgtech.ac.in', 'Gobbika J M', '25MX108', 'G1', 'T04', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx341@psgtech.ac.in', 'Radhu Dharsan K M', '25MX341', 'G2', 'T04', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx232@psgtech.ac.in', 'Vishaly S', '25MX232', 'G1', 'T04', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 5
('25mx216@psgtech.ac.in', 'Priyadharshini S', '25MX216', 'G1', 'T05', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx130@psgtech.ac.in', 'Vishal Karthikeyan. P', '25MX130', 'G1', 'T05', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx323@psgtech.ac.in', 'keerthanaa', '25MX323', 'G2', 'T05', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx328@psgtech.ac.in', 'Mithulesh N', '25MX328', 'G2', 'T05', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx222@psgtech.ac.in', 'SHANMUGA PRIYA S', '25MX222', 'G1', 'T05', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx345@psgtech.ac.in', 'Shri sanjay M', '25MX345', 'G2', 'T05', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 6
('25mx327@psgtech.ac.in', 'Mithra N', '25MX327', 'G2', 'T06', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx116@psgtech.ac.in', 'Miruna M V', '25MX116', 'G1', 'T06', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx228@psgtech.ac.in', 'SUPREETH K R', '25MX228', 'G1', 'T06', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx306@psgtech.ac.in', 'Chittesh', '25MX306', 'G2', 'T06', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx351@psgtech.ac.in', 'Suriya C S', '25MX351', 'G2', 'T06', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx203@psgtech.ac.in', 'Badhrinarayanan S K', '25MX203', 'G1', 'T06', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 7
('25mx336@psgtech.ac.in', 'Nitheesh Muthu Krishnan C', '25MX336', 'G2', 'T07', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx111@psgtech.ac.in', 'Jarjila Denet J', '25MX111', 'G1', 'T07', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx128@psgtech.ac.in', 'Sweatha A M', '25MX128', 'G1', 'T07', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx304@psgtech.ac.in', 'Aravindh Kannan M S', '25MX304', 'G2', 'T07', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx342@psgtech.ac.in', 'ROHITHMAHESHWARAN K', '25MX342', 'G2', 'T07', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx206@psgtech.ac.in', 'Devibala N', '25MX206', 'G1', 'T07', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 8
('25mx349@psgtech.ac.in', 'Sowmiya', '25MX349', 'G2', 'T08', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx109@psgtech.ac.in', 'GOPINATH R G', '25MX109', 'G1', 'T08', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx123@psgtech.ac.in', 'Sri Monika.J', '25MX123', 'G1', 'T08', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx305@psgtech.ac.in', 'Bhuvisha Sri Priya P', '25MX305', 'G2', 'T08', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx356@psgtech.ac.in', 'Vignesh', '25MX356', 'G2', 'T08', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx333@psgtech.ac.in', 'Naga Sruthi M', '25MX333', 'G2', 'T08', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 9
('25mx352@psgtech.ac.in', 'Tamilini S', '25MX352', 'G2', 'T09', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx106@psgtech.ac.in', 'Divya Dharshini K', '25MX106', 'G1', 'T09', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx126@psgtech.ac.in', 'Surya Krishna S', '25MX126', 'G1', 'T09', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx312@psgtech.ac.in', 'Dinesh', '25MX312', 'G2', 'T09', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx350@psgtech.ac.in', 'SRIVIKASHNI S', '25MX350', 'G2', 'T09', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx218@psgtech.ac.in', 'Reena Carolin S', '25MX218', 'G1', 'T09', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 10
('25mx358@psgtech.ac.in', 'Vikram Sethupathy S', '25MX358', 'G2', 'T10', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx117@psgtech.ac.in', 'MOHANKUMAR P', '25MX117', 'G1', 'T10', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx129@psgtech.ac.in', 'Thirupathi B', '25MX129', 'G1', 'T10', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx320@psgtech.ac.in', 'Joshnie T', '25MX320', 'G2', 'T10', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx353@psgtech.ac.in', 'Thrisha R', '25MX353', 'G2', 'T10', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx207@psgtech.ac.in', 'Dheepthi R.R', '25MX207', 'G1', 'T10', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 11
('25mx360@psgtech.ac.in', 'Yaswanth R T', '25MX360', 'G2', 'T11', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx107@psgtech.ac.in', 'Shree Nivetha', '25MX107', 'G1', 'T11', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx217@psgtech.ac.in', 'RGA SAKTHIVEL MALLAIAH', '25MX217', 'G1', 'T11', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx340@psgtech.ac.in', 'Puratchiyan.R', '25MX340', 'G2', 'T11', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx347@psgtech.ac.in', 'Sivapradeesh M', '25MX347', 'G2', 'T11', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx209@psgtech.ac.in', 'Divakar', '25MX209', 'G1', 'T11', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 12
('25mx125@psgtech.ac.in', 'Stephina Smily C', '25MX125', 'G1', 'T12', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx331@psgtech.ac.in', 'Mugundhan KP', '25MX331', 'G2', 'T12', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx309@psgtech.ac.in', 'Deepa M', '25MX309', 'G2', 'T12', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx339@psgtech.ac.in', 'Prabhakar O S', '25MX339', 'G2', 'T12', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx361@psgtech.ac.in', 'Sanjana M', '25MX361', 'G2', 'T12', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx226@psgtech.ac.in', 'Sudharsanan G', '25MX226', 'G1', 'T12', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 13
('25mx104@psgtech.ac.in', 'Deepikaa B S', '25MX104', 'G1', 'T13', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx119@psgtech.ac.in', 'Pon Akilesh', '25MX119', 'G1', 'T13', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx310@psgtech.ac.in', 'Dhakshanamoorthy S', '25MX310', 'G2', 'T13', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx329@psgtech.ac.in', 'Mohana Priya. M', '25MX329', 'G2', 'T13', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx362@psgtech.ac.in', 'Narayanasamy', '25MX362', 'G2', 'T13', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx223@psgtech.ac.in', 'Shanmugappriya K', '25MX223', 'G1', 'T13', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 14
('25mx114@psgtech.ac.in', 'Kavin M', '25MX114', 'G1', 'T14', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx214@psgtech.ac.in', 'Nagakeerthanaa N', '25MX214', 'G1', 'T14', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx319@psgtech.ac.in', 'Jessica.A', '25MX319', 'G2', 'T14', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx330@psgtech.ac.in', 'Monish P', '25MX330', 'G2', 'T14', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx363@psgtech.ac.in', 'Tharun S', '25MX363', 'G2', 'T14', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx220@psgtech.ac.in', 'SARAVANAVEL P', '25MX220', 'G1', 'T14', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 15
('25mx204@psgtech.ac.in', 'Chinnaya K', '25MX204', 'G1', 'T15', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx357@psgtech.ac.in', 'Vijaya Sree K', '25MX357', 'G2', 'T15', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx321@psgtech.ac.in', 'Karthick K', '25MX321', 'G2', 'T15', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx311@psgtech.ac.in', 'Dinesh', '25MX311', 'G2', 'T15', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx115@psgtech.ac.in', 'Krishna Priya m s', '25MX115', 'G1', 'T15', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx221@psgtech.ac.in', 'Shairaaj V S', '25MX221', 'G1', 'T15', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 16
('25mx124@psgtech.ac.in', 'Srinithi J', '25MX124', 'G1', 'T16', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx316@psgtech.ac.in', 'Jackson Solomon Raj M', '25MX316', 'G2', 'T16', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx317@psgtech.ac.in', 'Janani T G', '25MX317', 'G2', 'T16', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx338@psgtech.ac.in', 'Poorani R', '25MX338', 'G2', 'T16', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx225@psgtech.ac.in', 'Sriram', '25MX225', 'G1', 'T16', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx219@psgtech.ac.in', 'Saran k', '25MX219', 'G1', 'T16', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 17
('25mx212@psgtech.ac.in', 'Kartheesvaran S', '25MX212', 'G1', 'T17', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx215@psgtech.ac.in', 'Preethi S', '25MX215', 'G1', 'T17', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx344@psgtech.ac.in', 'Satya Pramodh R', '25MX344', 'G2', 'T17', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx103@psgtech.ac.in', 'BarathVikraman SK', '25MX103', 'G1', 'T17', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx201@psgtech.ac.in', 'ANUVARSHINI', '25MX201', 'G1', 'T17', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx346@psgtech.ac.in', 'Siddarth M R', '25MX346', 'G2', 'T17', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 18
('25mx127@psgtech.ac.in', 'Swarna Rathna A', '25MX127', 'G1', 'T18', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx230@psgtech.ac.in', 'S D S Thamizhthilaga', '25MX230', 'G1', 'T18', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx322@psgtech.ac.in', 'Kasbiya M', '25MX322', 'G2', 'T18', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx354@psgtech.ac.in', 'Tino Britty J', '25MX354', 'G2', 'T18', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": true}'), -- PLACEMENT REP
('25mx211@psgtech.ac.in', 'Joshna k', '25MX211', 'G1', 'T18', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx224@psgtech.ac.in', 'SRIRAM S S', '25MX224', 'G1', 'T18', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 19
('25mx326@psgtech.ac.in', 'Meyappan R', '25MX326', 'G2', 'T19', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx113@psgtech.ac.in', 'H Kaleel ur rahman', '25MX113', 'G1', 'T19', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx307@psgtech.ac.in', 'Darunya Sri', '25MX307', 'G2', 'T19', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx337@psgtech.ac.in', 'Nithyashree C', '25MX337', 'G2', 'T19', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx202@psgtech.ac.in', 'Arjun Vishwas B', '25MX202', 'G1', 'T19', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 20
('25mx325@psgtech.ac.in', 'Kirsaan F', '25MX325', 'G2', 'T20', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx101@psgtech.ac.in', 'Balaji K', '25MX101', 'G1', 'T20', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx110@psgtech.ac.in', 'HARIKESAN D J', '25MX110', 'G1', 'T20', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx355@psgtech.ac.in', 'Vaishnavi S', '25MX355', 'G2', 'T20', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx343@psgtech.ac.in', 'Sabarish P', '25MX343', 'G2', 'T20', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- TEAM 21
('25mx105@psgtech.ac.in', 'Divya .R', '25MX105', 'G1', 'T21', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('25mx122@psgtech.ac.in', 'Shaarukesh K.R', '25MX122', 'G1', 'T21', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx335@psgtech.ac.in', 'Naveen pranab T', '25MX335', 'G2', 'T21', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx324@psgtech.ac.in', 'Kevin Johnson A A', '25MX324', 'G2', 'T21', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('25mx112@psgtech.ac.in', 'Kaavya R', '25MX112', 'G1', 'T21', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),

-- DUMMY ACCOUNTS (For testing/development)
('dummy.student@psgtech.ac.in', 'Test Student', 'DUMMY001', 'G1', 'T01', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": false, "isPlacementRep": false}'),
('dummy.leader@psgtech.ac.in', 'Test Team Leader', 'DUMMY002', 'G1', 'T02', '{"isStudent": true, "isTeamLeader": true, "isCoordinator": false, "isPlacementRep": false}'),
('dummy.coordinator@psgtech.ac.in', 'Test Coordinator', 'DUMMY003', 'G1', 'T03', '{"isStudent": true, "isTeamLeader": false, "isCoordinator": true, "isPlacementRep": false}');

-- ============================================================================
-- SYNC PUBLIC.USERS WITH WHITELIST
-- Checks if any users already exist in public.users (via auth trigger) 
-- and ensures their details match the whitelist
-- ============================================================================
UPDATE public.users u
SET 
  team_id = w.team_id,
  roles = w.roles,
  batch = w.batch,
  name = w.name,
  reg_no = w.reg_no
FROM public.whitelist w
WHERE u.email = w.email;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT COUNT(*) as whitelist_count FROM public.whitelist;
