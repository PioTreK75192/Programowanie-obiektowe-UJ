<?php

namespace App\Controller;

use App\Entity\Customer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/customers')]
class ApiCustomerController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        $customers = $em->getRepository(Customer::class)->findAll();
        return $this->json($customers);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $customer = new Customer();
        $customer->setEmail($data['email'] ?? 'brak@email.pl');

        $em->persist($customer);
        $em->flush();

        return $this->json($customer, 201);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em): JsonResponse
    {
        $customer = $em->getRepository(Customer::class)->find($id);
        if (!$customer) {
            return $this->json(['message' => 'Not found'], 404);
        }

        $em->remove($customer);
        $em->flush();

        return $this->json(['message' => 'Deleted']);
    }
}
