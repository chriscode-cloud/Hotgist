const fetch = require('node-fetch');

async function testCommentEndpoints() {
  try {
    // First, get a list of posts to find a valid post ID
    console.log('Fetching posts...');
    const postsResponse = await fetch('http://192.168.100.177:3000/api/posts');
    const postsData = await postsResponse.json();
    
    if (postsData.posts && postsData.posts.length > 0) {
      const postId = postsData.posts[0].id;
      console.log(`Using post ID: ${postId}`);
      
      // Test adding a comment
      console.log('Testing comment addition...');
      const commentResponse = await fetch(`http://192.168.100.177:3000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'Test comment from Node.js',
          authorName: 'NodeJS Tester'
        }),
      });
      
      console.log(`Comment response status: ${commentResponse.status}`);
      const commentData = await commentResponse.json();
      console.log('Comment response:', JSON.stringify(commentData, null, 2));
      
      // Test getting comments
      console.log('Testing comment retrieval...');
      const getCommentsResponse = await fetch(`http://192.168.100.177:3000/api/posts/${postId}/comment`);
      console.log(`Get comments response status: ${getCommentsResponse.status}`);
      const getCommentsData = await getCommentsResponse.json();
      console.log('Get comments response:', JSON.stringify(getCommentsData, null, 2));
    } else {
      console.log('No posts found');
    }
  } catch (error) {
    console.error('Error testing comment endpoints:', error);
  }
}

testCommentEndpoints();