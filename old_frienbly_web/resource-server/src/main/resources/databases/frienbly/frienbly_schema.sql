CREATE TABLE if not exists user_details (
    user_id BIGINT,
    birthdate DATE,
    first_name VARCHAR(256),
    last_name VARCHAR(256),
    sex INT,
    image_id VARCHAR(256),
    image_rotation INT,
    looking_for_individuals BOOL,
    looking_for_groups BOOL,
    online_only BOOL,
    latitude DECIMAL(11, 8),
    longitude DECIMAL(11, 8),
    street VARCHAR(256),
    city VARCHAR(256),
    province VARCHAR(256),
    postal_code VARCHAR(256),
    country VARCHAR(256),
    about TEXT,
    last_activity DATETIME
);

CREATE TABLE if not exists reports (
    report_id BIGINT PRIMARY KEY auto_increment,
    reported_user_id BIGINT,
    reported_by_user_id BIGINT,
    reported_time DATETIME,
    reason VARCHAR(256)
);

CREATE TABLE if not exists blocks (
    block_id BIGINT PRIMARY KEY auto_increment,
    user_id BIGINT,
    target_user_id BIGINT,
    block_time DATETIME
);

CREATE TABLE if not exists groups (
    group_id BIGINT PRIMARY KEY auto_increment,
    name VARCHAR(128),
    enabled BOOL
);

CREATE TABLE if not exists group_members (
    member_type INT,
    group_id BIGINT,
    user_id BIGINT
);

CREATE TABLE if not exists group_details(
    group_id BIGINT,
    startdate DATE,
    enddate DATE,
    name VARCHAR(256),
    description VARCHAR(256),
    use_age BOOL,
    suggested_birthdate DATE,
    image_id VARCHAR(256),
    image_rotation INT,
    looking_for_individuals BOOL,
    looking_for_groups BOOL,
    is_private BOOL,
    online_only BOOL,
    latitude DECIMAL(11, 8),
    longitude DECIMAL(11, 8),
    street VARCHAR(256),
    city VARCHAR(256),
    province VARCHAR(256),
    postal_code VARCHAR(256),
    country VARCHAR(256)
);

CREATE TABLE if not exists tags(
    tag_id BIGINT PRIMARY KEY auto_increment,
    display VARCHAR(64)
);

CREATE TABLE if not exists flattened_tag_relations (
    tag_relation_id BIGINT PRIMARY KEY auto_increment,
    tag_id BIGINT,
    related_tag_id BIGINT
);

CREATE TABLE if not exists user_tags (
    user_id BIGINT,
    tag_id BIGINT,
    tag_type INT
);

CREATE TABLE if not exists group_tags (
    group_id BIGINT,
    tag_id BIGINT,
    tag_type INT
);

CREATE TABLE if not exists chats (
    chat_id BIGINT PRIMARY KEY auto_increment,
    last_activity DATETIME,
    chat_type INT,
    is_active BOOL
);

CREATE TABLE if not exists chat_views (
    chat_view_id BIGINT PRIMARY KEY auto_increment,
    last_view DATETIME,
    user_id BIGINT,
    chat_id BIGINT
);

CREATE TABLE if not exists chat_members (
    chat_member_id BIGINT PRIMARY KEY auto_increment,
    chat_id BIGINT,
    user_id BIGINT,
    group_id BIGINT,
    group_member_type INT
);

CREATE TABLE if not exists messages (
    message_id BIGINT PRIMARY KEY auto_increment,
    chat_id BIGINT,
    user_id BIGINT,
    message VARCHAR(256),
    sent_date_time DATETIME,
    system BOOL,
    image_height INT,
    giphy_url VARCHAR(256),
    image_id VARCHAR(256),
    image_rotation INT,
    event_id BIGINT,
    request_id BIGINT
);

CREATE TABLE if not exists requests (
    request_id BIGINT PRIMARY KEY auto_increment,
    user_id BIGINT,
    group_id BIGINT,
    group_member_type INT,
    target_user_id BIGINT,
    target_group_id BIGINT,
    target_group_member_type INT,
    request_type INT,
    active BOOL,
    accepted BOOL
);

CREATE TABLE if not exists events (
    event_id BIGINT PRIMARY KEY auto_increment,
    sent_by_user_id BIGINT,
    targetted_chat_id BIGINT,
    is_cancelled BOOLEAN,
    cancellation_time DATETIME,
    image_id VARCHAR(256),
    image_rotation INT,
    sent_date_time DATETIME,
    event_date_time DATETIME,
    event_name VARCHAR(256),
    event_description VARCHAR(256),
    location_name VARCHAR(256),
    online_only BOOLEAN,
    latitude DECIMAL(11, 8),
    longitude DECIMAL(11, 8),
    street VARCHAR(256),
    city VARCHAR(256),
    province VARCHAR(256),
    postal_code VARCHAR(256),
    country VARCHAR(256)
);

CREATE TABLE if not exists event_rsvp (
    event_rsvp_id BIGINT PRIMARY KEY auto_increment,
    event_id BIGINT,
    user_id BIGINT,
    rsvp_status_type INT,
    rsvp_sent_time DATETIME
);

CREATE TABLE if not exists feedback (
    feedback_id BIGINT PRIMARY KEY auto_increment,
    user_id BIGINT,
    feedback VARCHAR(256),
    feedback_type INT,
    sent_time DATETIME
);