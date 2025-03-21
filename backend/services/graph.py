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