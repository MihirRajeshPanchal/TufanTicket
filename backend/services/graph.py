from backend.constants.tufan import driver
from backend.models.events import Event
from backend.models.user import User
from backend.services import sentiment

def add_organizer_to_graph(user: User):
    """Creates an Organizer node directly (no User node)"""
    with driver.session() as session:
        session.run(
            """
            MERGE (o:Organizer {id: $id})
            ON CREATE SET
                o.clerkId = $clerkId,
                o.firstName = $firstName,
                o.lastName = $lastName,
                o.username = $username,
                o.email = $email,
                o.photo = $photo,
                o.createdAt = datetime()
            ON MATCH SET
                o.clerkId = $clerkId,
                o.firstName = $firstName,
                o.lastName = $lastName,
                o.username = $username,
                o.email = $email,
                o.photo = $photo,
                o.updatedAt = datetime()
            """,
            id=str(user.id),
            clerkId=user.clerkId,
            firstName=user.firstName,
            lastName=user.lastName,
            username=user.username,
            email=user.email,
            photo=user.photo
        )
    
    driver.close()

def add_attendee_to_graph(user: User):
    """Creates an Attendee node directly (no User node)"""
    with driver.session() as session:
        session.run(
            """
            MERGE (a:Attendee {id: $id})
            ON CREATE SET
                a.clerkId = $clerkId,
                a.firstName = $firstName,
                a.lastName = $lastName,
                a.username = $username,
                a.email = $email,
                a.photo = $photo,
                a.createdAt = datetime()
            ON MATCH SET
                a.clerkId = $clerkId,
                a.firstName = $firstName,
                a.lastName = $lastName,
                a.username = $username,
                a.email = $email,
                a.photo = $photo,
                a.updatedAt = datetime()
            """,
            id=str(user.id),
            clerkId=user.clerkId,
            firstName=user.firstName,
            lastName=user.lastName,
            username=user.username,
            email=user.email,
            photo=user.photo
        )
    
    driver.close()
    
def add_event_to_graph(event: Event):
    with driver.session() as session:
        session.run(
            """
            MERGE (e:Event {id: $id})
            ON CREATE SET
                e.title = $title,
                e.description = $description,
                e.location = $location,
                e.imageUrl = $imageUrl,
                e.startDateTime = datetime($startDateTime),
                e.endDateTime = datetime($endDateTime),
                e.isFree = $isFree,
                e.url = $url,
                e.createdAt = datetime()
            ON MATCH SET
                e.title = $title,
                e.description = $description,
                e.location = $location,
                e.imageUrl = $imageUrl,
                e.startDateTime = datetime($startDateTime),
                e.endDateTime = datetime($endDateTime),
                e.isFree = $isFree,
                e.url = $url,
                e.updatedAt = datetime()
            """,
            id=event.id,
            title=event.title,
            description=event.description,
            location=event.location,
            imageUrl=event.imageUrl,
            startDateTime=event.startDateTime.isoformat(),
            endDateTime=event.endDateTime.isoformat(),
            isFree=event.isFree,
            url=event.url
        )

        
        if event.organizerId:
            session.run(
                """
                MERGE (o:Organizer {id: $organizerId})
                MERGE (e:Event {id: $eventId})
                MERGE (o)-[:ORGANIZED]->(e)
                """,
                eventId=event.id,
                organizerId=event.organizerId
            )
    
    driver.close()

def add_category_to_graph(event_id: str, category_id: str, category_name: str):
    with driver.session() as session:
        session.run(
            """
            MERGE (c:Category {id: $categoryId})
            ON CREATE SET c.name = $categoryName, c.createdAt = datetime()
            MERGE (e:Event {id: $eventId})
            MERGE (e)-[:IS_A]->(c)
            """,
            categoryId=category_id,
            categoryName=category_name,
            eventId=event_id
        ) 
        
def create_attends_relationship(user_id: str, event_id: str):
    with driver.session() as session:
        
        session.run(
            """
            MERGE (a:Attendee {id: $userId})
            MERGE (e:Event {id: $eventId})
            MERGE (a)-[:ATTENDS]->(e)
            """,
            userId=user_id,
            eventId=event_id
        )
    
    driver.close()

def remove_user_nodes():
    """Remove any existing User nodes and their relationships from the graph."""
    with driver.session() as session:
        
        session.run(
            """
            MATCH (u:User)
            DETACH DELETE u
            """
        )
    
    driver.close() 
    
def add_comment_to_graph(comment_id: str, event_id: str, text: str):
    """Creates a Comment node and connects it to an Event node"""
    sentimentScore = sentiment.get_conviction_score(text)
    with driver.session() as session:
        session.run(
            """
            MERGE (c:Comment {id: $commentId})
            ON CREATE SET
                c.text = $text,
                c.displayText = $text,  
                c.sentiment = $sentimentScore,
                c.createdAt = datetime()
            ON MATCH SET
                c.text = $text,
                c.displayText = $text,
                c.updatedAt = datetime()
            WITH c
            MATCH (e:Event {id: $eventId})
            MERGE (c)-[:BELONGS_TO]->(e)
            """,
            commentId=comment_id,
            eventId=event_id,
            text=text,
            sentimentScore=sentimentScore
        )
    
    driver.close()
    
def add_all_comments_to_graph():
    """Batch process to add all comments from MongoDB to Neo4j"""
    from backend.constants.tufan import mongo_client
    
    comment_data = mongo_client.read_all("comments")
    comment_count = 0
    
    for comment_doc in comment_data:
        if "eventId" in comment_doc and comment_doc["eventId"] and "comments" in comment_doc:
            event_id = str(comment_doc["eventId"])
            
            for comment in comment_doc["comments"]:
                comment_id = str(comment["_id"])
                text = comment.get("text", "")
                
                add_comment_to_graph(comment_id, event_id, text)
                comment_count += 1
    
    return comment_count
