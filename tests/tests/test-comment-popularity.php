<?php

Class Test_HMN_Comment_Popularity extends HMN_Comment_PopularityTestCase {

	const CLASS_NAME = 'HMN_Comment_Popularity';

	protected $test_user_id;

	protected $test_post_id;

	protected $test_comment_id;

	protected $instance;

	public function setUp() {

		parent::setUp();

		$this->instance = HMN_Comment_Popularity::get_instance();

		$this->test_user_id = $this->factory->user->create(
			array(
				'role'       => 'administrator',
				'user_login' => 'test_admin',
				'email'      => 'test@land.com',
			)
		);
		wp_set_current_user( $this->test_user_id );

		// set interval to 30 seconds
		add_filter( 'hmn_cp_interval', function(){
			return 5;
		});


		// insert a post
		$this->test_post_id = $this->factory->post->create();

		// insert a comment on our test post
		$comment_date = current_time( 'mysql' );

		$this->test_comment_id = $this->factory->comment->create( array(
			'comment_date'    => $comment_date,
			'comment_post_ID' => $this->test_post_id,
		) );

	}

	public function tearDown() {

		parent::tearDown();

		$this->instance = null;

		wp_delete_comment( $this->test_comment_id );

		wp_delete_post( $this->test_post_id );

		wp_delete_user( $this->test_user_id );
	}

	/**
	 * Check if get instance function return a valid instance of the strem class
	 *
	 * @return void
	 */
	public function test_get_instance() {

		$this->instance = HMN_Comment_Popularity::get_instance();

		$this->assertInstanceOf( 'HMN_Comment_Popularity', $this->instance );

	}

	public function test_too_soon_to_vote_again() {

		$this->instance->comment_vote( 1, $this->test_comment_id );

		$ret = $this->instance->comment_vote( -1, $this->test_comment_id );

		$this->assertEquals( 'voting_flood', $ret['error_code'] );

	}

	public function test_has_permission_to_vote() {

	}

	public function test_prevent_same_vote_twice() {

		$this->instance->comment_vote( 1, $this->test_comment_id );

		$ret = $this->instance->comment_vote( 1, $this->test_comment_id );

		sleep( 7 );

		$this->assertEquals( 'same_action', $ret['error_code'] );
	}

	public function test_upvote_comment() {

		$vote_time = current_time( 'timestamp' );

		$action = 'upvote';

		$result = $this->instance->update_comments_voted_on_for_user( $this->test_user_id, $this->test_comment_id, $action );

		$expected = array(
				'vote_time' => $vote_time,
				'last_action' => $action
		);

		$this->assertEquals( $expected, $result );

	}

}