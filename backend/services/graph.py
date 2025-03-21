from backend.constants.tufan import driver
from backend.models.events import Event
from backend.models.user import User

def add_user_to_graph(user: User):
    with driver.session() as session:
        
        session.run(
            """
            MERGE (u:User {id: $id})
            ON CREATE SET
                u.clerkId = $clerkId,
                u.firstName = $firstName,
                u.lastName = $lastName,
                u.username = $username,
                u.email = $email,
                u.photo = $photo,
                u.createdAt = datetime()
            ON MATCH SET
                u.clerkId = $clerkId,
                u.firstName = $firstName,
                u.lastName = $lastName,
                u.username = $username,
                u.email = $email,
                u.photo = $photo,
                u.updatedAt = datetime()
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
                MATCH (e:Event {id: $eventId})
                MATCH (o:User {id: $organizerId})
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