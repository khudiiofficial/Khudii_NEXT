-- Khudii database schema (structure only)
-- Compatible with MySQL/MariaDB.
-- Import this file into the database selected by DB_NAME.
-- Production records and credentials are intentionally excluded.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--

-- --------------------------------------------------------

--
-- Table structure for table `bankdata`
--

CREATE TABLE `bankdata` (
  `id` int(11) NOT NULL DEFAULT 1,
  `name` varchar(255) NOT NULL COMMENT 'Bank name',
  `imagepath` varchar(500) DEFAULT NULL COMMENT 'Path to bank logo/image on FTP',
  `account_title` varchar(255) NOT NULL COMMENT 'Account title',
  `branch` varchar(255) DEFAULT NULL COMMENT 'Bank branch name',
  `iban` varchar(100) DEFAULT NULL COMMENT 'IBAN number',
  `accountNumber` varchar(100) DEFAULT NULL COMMENT 'Account number',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `ceo`
--

CREATE TABLE `ceo` (
  `id` int(11) NOT NULL,
  `name` text DEFAULT NULL,
  `title` text DEFAULT NULL,
  `paragraph1` text DEFAULT NULL,
  `paragraph2` text DEFAULT NULL,
  `paragraph3` text DEFAULT NULL,
  `image_path` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `certifications`
--

CREATE TABLE `certifications` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_inquiries`
--

CREATE TABLE `contact_inquiries` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `message` text DEFAULT NULL,
  `country_code` varchar(10) DEFAULT '92',
  `country_name` varchar(100) DEFAULT 'Pakistan',
  `country` varchar(10) DEFAULT 'PK',
  `org_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `subject` varchar(150) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `countryCode` varchar(10) DEFAULT NULL,
  `countryName` varchar(100) DEFAULT NULL,
  `country` varchar(10) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contribute_stories`
--

CREATE TABLE `contribute_stories` (
  `id` int(11) NOT NULL,
  `entityType` enum('Individual','Organization') NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `countryCode` varchar(10) DEFAULT NULL,
  `CountryName` varchar(100) DEFAULT NULL,
  `country` varchar(10) DEFAULT NULL,
  `company` varchar(150) DEFAULT NULL,
  `story` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `crousel_images`
--

CREATE TABLE `crousel_images` (
  `id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `isMobile` tinyint(1) DEFAULT 0 COMMENT 'Flag to identify if image is for mobile devices'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document`
--

CREATE TABLE `document` (
  `id` int(11) NOT NULL,
  `intro` text NOT NULL,
  `conclusion` text NOT NULL,
  `image_path` text DEFAULT NULL,
  `Name` text DEFAULT NULL,
  `deletestatus` tinyint(1) DEFAULT 0,
  `slug` text DEFAULT NULL,
  `meta_title` text DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documentarr`
--

CREATE TABLE `documentarr` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `heading` varchar(255) DEFAULT NULL,
  `start` text DEFAULT NULL,
  `bullet_header` varchar(255) DEFAULT NULL,
  `end` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documentarrbullets`
--

CREATE TABLE `documentarrbullets` (
  `id` int(11) NOT NULL,
  `arr_id` int(11) NOT NULL,
  `bullet` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `donations`
--

CREATE TABLE `donations` (
  `id` int(11) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `countryCode` varchar(10) DEFAULT NULL,
  `CountryName` varchar(100) DEFAULT NULL,
  `country` varchar(10) DEFAULT NULL,
  `donationAmount` decimal(12,2) NOT NULL,
  `donationType` enum('General','Sadqa','Zakat') NOT NULL,
  `address1` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT 'pending',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dream_and_purpose`
--

CREATE TABLE `dream_and_purpose` (
  `id` int(11) NOT NULL,
  `heading` text DEFAULT NULL,
  `paragraph` text DEFAULT NULL,
  `bullets_header` text DEFAULT NULL,
  `bullets` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bullets`)),
  `conclusion` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(500) NOT NULL,
  `url` varchar(500) NOT NULL,
  `videoId` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_description`
--

CREATE TABLE `event_description` (
  `id` int(11) NOT NULL,
  `description` text NOT NULL,
  `imagepath1` varchar(500) DEFAULT NULL,
  `imagepath2` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expert_team`
--

CREATE TABLE `expert_team` (
  `id` int(11) NOT NULL,
  `image_path` text DEFAULT NULL,
  `image_alt` text DEFAULT NULL,
  `name` text DEFAULT NULL,
  `position` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` int(11) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `footercontents`
--

CREATE TABLE `footercontents` (
  `id` int(11) NOT NULL,
  `logoimage` text DEFAULT NULL,
  `pageimage` text DEFAULT NULL,
  `footertext` text DEFAULT NULL,
  `email` text DEFAULT NULL,
  `location` text DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `locationinfo` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `icons`
--

CREATE TABLE `icons` (
  `id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `svg` longtext NOT NULL,
  `qty` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `impact`
--

CREATE TABLE `impact` (
  `id` int(11) NOT NULL,
  `heading` text DEFAULT NULL,
  `paragraph1` text DEFAULT NULL,
  `paragraph2` text DEFAULT NULL,
  `paragraph3` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `youtube_video_url` longtext DEFAULT NULL,
  `introductory_image_path` varchar(500) DEFAULT NULL,
  `category` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`category`)),
  `deletestatus` tinyint(1) DEFAULT 0,
  `slug` text DEFAULT NULL,
  `meta_title` text DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `search_tags` text DEFAULT NULL,
  `partner_image` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `item_images`
--

CREATE TABLE `item_images` (
  `id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `image_path` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `item_urls`
--

CREATE TABLE `item_urls` (
  `id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `urls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`urls`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_applications`
--

CREATE TABLE `job_applications` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `countryCode` varchar(10) DEFAULT NULL,
  `CountryName` varchar(100) DEFAULT NULL,
  `country` varchar(10) DEFAULT NULL,
  `experience` decimal(4,1) NOT NULL,
  `qualification` varchar(150) DEFAULT NULL,
  `interestedPost` varchar(150) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `join_us`
--

CREATE TABLE `join_us` (
  `id` int(11) NOT NULL,
  `heading` text DEFAULT NULL,
  `paragraph` text DEFAULT NULL,
  `bullets` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bullets`)),
  `paragraph2` text DEFAULT NULL,
  `paragraph3` text DEFAULT NULL,
  `youtube_video_id` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `new_section`
--

CREATE TABLE `new_section` (
  `id` int(11) NOT NULL,
  `heading` text DEFAULT NULL,
  `paragraphs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`paragraphs`)),
  `bullets_header` text DEFAULT NULL,
  `bullets` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bullets`)),
  `image_path` text DEFAULT NULL,
  `youtube_video_id` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ngos`
--

CREATE TABLE `ngos` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `intro` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ngosarr`
--

CREATE TABLE `ngosarr` (
  `id` int(11) NOT NULL,
  `ngos_id` int(11) NOT NULL,
  `h1` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ngosarrof`
--

CREATE TABLE `ngosarrof` (
  `id` int(11) NOT NULL,
  `ngos_arr_id` int(11) NOT NULL,
  `value` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organization_submissions`
--

CREATE TABLE `organization_submissions` (
  `id` int(11) NOT NULL,
  `organization_name` varchar(255) NOT NULL,
  `contact_person_name` varchar(255) NOT NULL,
  `contact_person_mobile` varchar(50) NOT NULL,
  `landline_uan` varchar(50) DEFAULT NULL,
  `website_url` text DEFAULT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `facebook_link` text DEFAULT NULL,
  `instagram_link` text DEFAULT NULL,
  `youtube_link` text DEFAULT NULL,
  `linkedin_link` text DEFAULT NULL,
  `twitter_link` text DEFAULT NULL,
  `year_established` year(4) NOT NULL,
  `total_beneficiaries_served` int(11) DEFAULT NULL,
  `total_projects_completed` int(11) DEFAULT NULL,
  `active_projects` int(11) DEFAULT NULL,
  `organization_logo_path` text DEFAULT NULL,
  `user_google_email` varchar(255) DEFAULT NULL,
  `user_google_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `owners`
--

CREATE TABLE `owners` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(191) NOT NULL,
  `sender_email` varchar(191) NOT NULL,
  `sender_app_password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `people_behind`
--

CREATE TABLE `people_behind` (
  `id` int(11) NOT NULL,
  `heading` text DEFAULT NULL,
  `paragraph1` text DEFAULT NULL,
  `paragraph2` text DEFAULT NULL,
  `paragraph3` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sectors`
--

CREATE TABLE `sectors` (
  `id` int(11) NOT NULL,
  `src` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `deletestatus` tinyint(4) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `meta_title` text DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `socials`
--

CREATE TABLE `socials` (
  `id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `phone` varchar(500) DEFAULT NULL,
  `facebook` varchar(500) DEFAULT NULL,
  `twitter` varchar(500) DEFAULT NULL,
  `instagram` varchar(500) DEFAULT NULL,
  `location` varchar(500) DEFAULT NULL,
  `googlemap` longtext NOT NULL,
  `Mobile_number` varchar(500) DEFAULT NULL,
  `website` text DEFAULT NULL,
  `youtubechannel` text DEFAULT NULL,
  `email` text DEFAULT NULL,
  `linkedin` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stories_description`
--

CREATE TABLE `stories_description` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image_path` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `successstories`
--

CREATE TABLE `successstories` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `urdu_title` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `youtube_id` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `deletestatus` tinyint(1) DEFAULT 0,
  `slug` text DEFAULT NULL,
  `meta_title` text DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supporting_documents`
--

CREATE TABLE `supporting_documents` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `file_path` text NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `telephone`
--

CREATE TABLE `telephone` (
  `id` int(11) NOT NULL,
  `phone_number` varchar(500) NOT NULL,
  `icon_name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `testimonials`
--

CREATE TABLE `testimonials` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'Unknown',
  `position` varchar(255) NOT NULL DEFAULT '',
  `thumbnail` varchar(500) NOT NULL DEFAULT '',
  `video_url` varchar(500) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT '',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `topbarcontent`
--

CREATE TABLE `topbarcontent` (
  `id` int(11) NOT NULL,
  `text` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `videos`
--

CREATE TABLE `videos` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `youtube_id` varchar(50) NOT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `deletestatus` tinyint(1) DEFAULT 0,
  `slug` text DEFAULT NULL,
  `meta_title` text DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vision_mission_items`
--

CREATE TABLE `vision_mission_items` (
  `id` int(11) NOT NULL,
  `icon` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `volunteers`
--

CREATE TABLE `volunteers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `countryCode` varchar(10) DEFAULT NULL,
  `CountryName` varchar(100) DEFAULT NULL,
  `country` varchar(10) DEFAULT NULL,
  `contactTime` varchar(100) NOT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `website_seo`
--

CREATE TABLE `website_seo` (
  `id` int(11) NOT NULL,
  `url` text NOT NULL,
  `pages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`pages`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `welcomesection`
--

CREATE TABLE `welcomesection` (
  `id` int(11) NOT NULL,
  `welcome_title` varchar(255) NOT NULL,
  `welcome_description` text DEFAULT NULL,
  `youtube_video_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `who_we_are`
--

CREATE TABLE `who_we_are` (
  `id` int(11) NOT NULL,
  `heading` text DEFAULT NULL,
  `paragraph1` text DEFAULT NULL,
  `paragraph2` text DEFAULT NULL,
  `youtube_video_id` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bankdata`
--
ALTER TABLE `bankdata`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ceo`
--
ALTER TABLE `ceo`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `certifications`
--
ALTER TABLE `certifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_inquiries`
--
ALTER TABLE `contact_inquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_org_id` (`org_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contribute_stories`
--
ALTER TABLE `contribute_stories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `crousel_images`
--
ALTER TABLE `crousel_images`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `document`
--
ALTER TABLE `document`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `documentarr`
--
ALTER TABLE `documentarr`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_id` (`document_id`);

--
-- Indexes for table `documentarrbullets`
--
ALTER TABLE `documentarrbullets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `arr_id` (`arr_id`);

--
-- Indexes for table `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dream_and_purpose`
--
ALTER TABLE `dream_and_purpose`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `event_description`
--
ALTER TABLE `event_description`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expert_team`
--
ALTER TABLE `expert_team`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_display_order` (`display_order`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `footercontents`
--
ALTER TABLE `footercontents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `icons`
--
ALTER TABLE `icons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `impact`
--
ALTER TABLE `impact`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `item_images`
--
ALTER TABLE `item_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `item_urls`
--
ALTER TABLE `item_urls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `join_us`
--
ALTER TABLE `join_us`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `new_section`
--
ALTER TABLE `new_section`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ngos`
--
ALTER TABLE `ngos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_id` (`document_id`);

--
-- Indexes for table `ngosarr`
--
ALTER TABLE `ngosarr`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ngos_id` (`ngos_id`);

--
-- Indexes for table `ngosarrof`
--
ALTER TABLE `ngosarrof`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ngos_arr_id` (`ngos_arr_id`);

--
-- Indexes for table `organization_submissions`
--
ALTER TABLE `organization_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_org_name` (`organization_name`);

--
-- Indexes for table `owners`
--
ALTER TABLE `owners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `people_behind`
--
ALTER TABLE `people_behind`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sectors`
--
ALTER TABLE `sectors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `socials`
--
ALTER TABLE `socials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `stories_description`
--
ALTER TABLE `stories_description`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `successstories`
--
ALTER TABLE `successstories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `supporting_documents`
--
ALTER TABLE `supporting_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_submission` (`submission_id`);

--
-- Indexes for table `telephone`
--
ALTER TABLE `telephone`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `topbarcontent`
--
ALTER TABLE `topbarcontent`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `videos`
--
ALTER TABLE `videos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `vision_mission_items`
--
ALTER TABLE `vision_mission_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `volunteers`
--
ALTER TABLE `volunteers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `website_seo`
--
ALTER TABLE `website_seo`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `welcomesection`
--
ALTER TABLE `welcomesection`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `who_we_are`
--
ALTER TABLE `who_we_are`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ceo`
--
ALTER TABLE `ceo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `certifications`
--
ALTER TABLE `certifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_inquiries`
--
ALTER TABLE `contact_inquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contribute_stories`
--
ALTER TABLE `contribute_stories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `crousel_images`
--
ALTER TABLE `crousel_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document`
--
ALTER TABLE `document`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documentarr`
--
ALTER TABLE `documentarr`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documentarrbullets`
--
ALTER TABLE `documentarrbullets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `donations`
--
ALTER TABLE `donations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dream_and_purpose`
--
ALTER TABLE `dream_and_purpose`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_description`
--
ALTER TABLE `event_description`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expert_team`
--
ALTER TABLE `expert_team`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `footercontents`
--
ALTER TABLE `footercontents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `icons`
--
ALTER TABLE `icons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `impact`
--
ALTER TABLE `impact`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `item_images`
--
ALTER TABLE `item_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `item_urls`
--
ALTER TABLE `item_urls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_applications`
--
ALTER TABLE `job_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `join_us`
--
ALTER TABLE `join_us`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `new_section`
--
ALTER TABLE `new_section`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ngos`
--
ALTER TABLE `ngos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ngosarr`
--
ALTER TABLE `ngosarr`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ngosarrof`
--
ALTER TABLE `ngosarrof`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `organization_submissions`
--
ALTER TABLE `organization_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `owners`
--
ALTER TABLE `owners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `people_behind`
--
ALTER TABLE `people_behind`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sectors`
--
ALTER TABLE `sectors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `socials`
--
ALTER TABLE `socials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stories_description`
--
ALTER TABLE `stories_description`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `successstories`
--
ALTER TABLE `successstories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supporting_documents`
--
ALTER TABLE `supporting_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `telephone`
--
ALTER TABLE `telephone`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `testimonials`
--
ALTER TABLE `testimonials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `topbarcontent`
--
ALTER TABLE `topbarcontent`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `videos`
--
ALTER TABLE `videos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vision_mission_items`
--
ALTER TABLE `vision_mission_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `volunteers`
--
ALTER TABLE `volunteers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `website_seo`
--
ALTER TABLE `website_seo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `welcomesection`
--
ALTER TABLE `welcomesection`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `who_we_are`
--
ALTER TABLE `who_we_are`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `supporting_documents`
--
ALTER TABLE `supporting_documents`
  ADD CONSTRAINT `supporting_documents_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `organization_submissions` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
