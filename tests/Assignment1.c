#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/wait.h>

int main()
{
    int pipe1[2];   // Child -> Parent
    int pipe2[2];   // Parent -> Child

    pid_t pid;

    char child_msg[] = "Hello Parent, data sent from Child";
    char parent_msg[] = "Hello Child, data sent from Parent";

    char buffer[100];

    // Create two pipes
    if (pipe(pipe1) == -1 || pipe(pipe2) == -1)
    {
        perror("pipe");
        exit(EXIT_FAILURE);
    }

    // Create child process
    pid = fork();

    if (pid < 0)
    {
        perror("fork");
        exit(EXIT_FAILURE);
    }

    if (pid == 0) // CHILD PROCESS
    {
        // Close unused ends
        close(pipe1[0]);  // Child does not read from pipe1
        close(pipe2[1]);  // Child does not write to pipe2

        // Send data to Parent
        write(pipe1[1], child_msg, strlen(child_msg) + 1);

        printf("Child: Data sent to Parent.\n");

        // Receive data from Parent
        read(pipe2[0], buffer, sizeof(buffer));

        printf("Child: Received from Parent: %s\n", buffer);

        // Close pipes
        close(pipe1[1]);
        close(pipe2[0]);

        exit(0);
    }
    else // PARENT PROCESS
    {
        // Close unused ends
        close(pipe1[1]);  // Parent does not write to pipe1
        close(pipe2[0]);  // Parent does not read from pipe2

        // Receive data from Child
        read(pipe1[0], buffer, sizeof(buffer));

        printf("Parent: Received from Child: %s\n", buffer);

        // Send data to Child
        write(pipe2[1], parent_msg, strlen(parent_msg) + 1);

        printf("Parent: Data sent to Child.\n");

        // Close pipes
        close(pipe1[0]);
        close(pipe2[1]);

        // Wait for child to finish
        wait(NULL);
    }

    return 0;
}